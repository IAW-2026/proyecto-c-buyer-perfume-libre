import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarYGuardarResumenIA } from "@/actions/resumen-ia";
import { withApiHandler, UnauthorizedError } from "@/lib/errors";

// Umbral de reseñas nuevas necesarias para re-ejecutar el análisis de IA
const UMBRAL_DE_ACTUALIZACION = 5;
// Límite de productos a procesar por ejecución para respetar el tiempo límite del runtime
const LIMITE_POR_LOTE = 5;
const MAX_DURACION_MS = 25_000;

export const GET = withApiHandler(async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    throw new UnauthorizedError("No autorizado para ejecutar tareas cron");
  }

  const tiempoInicio = Date.now();
  const reporte: Array<{
    productoId: string;
    status: "Actualizado" | "Ignorado" | "Error" | "Omitido";
    resenasTotales?: number;
    resenasNuevas?: number;
    motivo?: string;
  }> = [];

  // 1. Obtener productos con reseñas registradas en la base de datos
  const productosConResenas = await prisma.resenaProducto.groupBy({
    by: ["productoId"],
    _count: {
      id: true,
    },
  });

  if (productosConResenas.length === 0) {
    return NextResponse.json({
      exito: true,
      mensaje: "No hay productos con reseñas para procesar",
      reporte: [],
      duracionMs: Date.now() - tiempoInicio,
    });
  }

  // 2. Consultar resúmenes existentes
  const productoIds = productosConResenas.map((p) => p.productoId);
  const resumenesExistentes = await prisma.resumenProductoIA.findMany({
    where: {
      productoId: { in: productoIds },
    },
  });

  const mapaResumenes = new Map(
    resumenesExistentes.map((r) => [r.productoId, r]),
  );

  // 3. Filtrar y ordenar priorizando los que nunca tuvieron resumen o tienen mayor delta
  const candidatos = productosConResenas
    .map((item) => {
      const resumen = mapaResumenes.get(item.productoId);
      const total = item._count.id;
      const procesadas = resumen?.resenasProcesadas ?? 0;
      const resenasNuevas = total - procesadas;
      const requiereActualizacion = !resumen || resenasNuevas >= UMBRAL_DE_ACTUALIZACION;

      return {
        productoId: item.productoId,
        total,
        procesadas,
        resenasNuevas,
        requiereActualizacion,
      };
    })
    .filter((c) => c.requiereActualizacion)
    .sort((a, b) => b.resenasNuevas - a.resenasNuevas)
    .slice(0, LIMITE_POR_LOTE);

  // 4. Procesar el lote de candidatos con control de duración
  for (const item of candidatos) {
    const tiempoTranscurrido = Date.now() - tiempoInicio;
    if (tiempoTranscurrido > MAX_DURACION_MS) {
      reporte.push({
        productoId: item.productoId,
        status: "Omitido",
        motivo: "Límite de tiempo por ejecución alcanzado",
      });
      continue;
    }

    try {
      const resultado = await generarYGuardarResumenIA(item.productoId);
      if (resultado) {
        reporte.push({
          productoId: item.productoId,
          status: "Actualizado",
          resenasTotales: item.total,
          resenasNuevas: item.resenasNuevas,
        });
      } else {
        reporte.push({
          productoId: item.productoId,
          status: "Ignorado",
          motivo: "Sin reseñas válidas o IA no disponible",
        });
      }
    } catch (err) {
      reporte.push({
        productoId: item.productoId,
        status: "Error",
        motivo: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    exito: true,
    mensaje: `Sincronización de resúmenes IA completada. ${reporte.filter((r) => r.status === "Actualizado").length} productos actualizados.`,
    procesados: reporte.length,
    duracionMs: Date.now() - tiempoInicio,
    reporte,
  });
});
