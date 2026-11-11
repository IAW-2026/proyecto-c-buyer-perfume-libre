import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarYGuardarResumenIA } from "@/actions/resumen-ia";
import { obtenerResenasDelProducto } from "@/lib/mockResenas";

// Umbral de reseñas nuevas para actualizar el resumen.
const UMBRAL_DE_ACTUALIZACION = 5;

// Lista de productos a sincronizar, en producción se llenará dinámicamente.
// TODO: En producción, obtener la lista de productos.
const PRODUCTOS_A_SINCRONIZAR = ["1", "2", "3"];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const reporte = [];

    for (const productoId of PRODUCTOS_A_SINCRONIZAR) {
      const resenas = await obtenerResenasDelProducto(productoId);
      const totalResenas = resenas?.length || 0;

      const resumenLocal = await prisma.resumenProductoIA.findUnique({
        where: { productoId },
      });

      const procesadasAnteriormente = resumenLocal?.resenasProcesadas || 0;
      const resenasNuevas = totalResenas - procesadasAnteriormente;

      if (resenasNuevas > UMBRAL_DE_ACTUALIZACION) {
        await generarYGuardarResumenIA(productoId);
        reporte.push({ productoId, status: "Actualizado", resenasNuevas });
      } else {
        reporte.push({ productoId, status: "Ignorado", resenasNuevas });
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Sincronización por lotes finalizada",
      reporte,
    });
  } catch (error) {
    console.error("Error en el cron job:", error);
    return NextResponse.json(
      { error: "Fallo interno en el Cron Job" },
      { status: 500 },
    );
  }
}
