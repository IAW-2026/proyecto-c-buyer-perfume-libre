"use server";

import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Set en memoria para deduplicar ejecuciones de IA en background y evitar
 * llamadas concurrentes (Thundering Herd) sobre el mismo producto.
 */
const productosEnProceso = new Set<string>();

export interface ResenaItem {
  id: string;
  productoId: string;
  rating: number;
  comentario: string;
  fecha: string;
}

/**
 * Obtiene las reseñas reales de la base de datos local para un producto.
 * Si no existen reseñas en BD, retorna una lista vacía.
 */
export async function obtenerResenasDelProducto(
  productoId: string,
): Promise<ResenaItem[]> {
  const resenasDb = await prisma.resenaProducto.findMany({
    where: { productoId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return resenasDb.map((r) => ({
    id: r.id,
    productoId: r.productoId,
    rating: r.puntuacion,
    comentario: r.comentario || "",
    fecha: r.createdAt.toISOString(),
  }));
}

/**
 * Genera el resumen con Groq LLM y lo persiste en la base de datos.
 * Esta función está pensada para ser llamada de forma asíncrona o desde el Cron Job,
 * NUNCA de forma síncrona dentro del render de un Server Component.
 */
export async function generarYGuardarResumenIA(productoId: string) {
  try {
    const resenas = await obtenerResenasDelProducto(productoId);

    if (!resenas || resenas.length === 0) {
      return null;
    }

    // Opcionalmente buscar reseñas de vendedores asociadas a este producto
    const resenasVendedor = await prisma.resenaVendedor.findMany({
      where: {
        ordenCompra: {
          items: {
            some: { productoId },
          },
        },
      },
      take: 10,
    });

    const textoResenas = resenas
      .map((r) => `[Rating: ${r.rating}/5] - ${r.comentario}`)
      .join("\n");

    const textoVendedor = resenasVendedor.length > 0
      ? `\nReseñas de atención/envío:\n` +
        resenasVendedor.map((v) => `[Rating: ${v.puntuacion}/5] - ${v.comentario || "Sin comentario"}`).join("\n")
      : "";

    const prompt = `
      Sos un analista experto en e-commerce. Analiza las siguientes reseñas de un perfume vendido en un marketplace C2C.
      Extrae los patrones principales y devuelve un resumen ultra conciso para el comprador.
      
      Reglas estrictas:
      - Máximo 15 palabras para el resumen del producto.
      - Máximo 15 palabras para el resumen del vendedor.
      - Tono neutral y directo. Cero formalidades exageradas.

      Reseñas del producto:
      ${textoResenas}
      ${textoVendedor}
    `;

    // Si no hay API key de Groq configurada, omitir llamada para no romper entornos locales
    if (!process.env.GROQ_API_KEY) {
      console.warn(`[IA] GROQ_API_KEY no configurada. Omitiendo generación de resumen para ${productoId}.`);
      return null;
    }

    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      output: Output.object({
        schema: z.object({
          sentimientoGeneral: z.enum(["Excelente", "Bueno", "Regular", "Malo"]),
          resumenProducto: z
            .string()
            .describe("Resumen de calidad, aroma y duración."),
          resumenVendedor: z
            .string()
            .describe("Resumen sobre el envío, empaque y trato."),
        }),
      }),
      prompt: prompt,
    });

    const resumenGuardado = await prisma.resumenProductoIA.upsert({
      where: {
        productoId: productoId,
      },
      update: {
        resumenProducto: output.resumenProducto,
        resumenVendedor: output.resumenVendedor,
        resenasProcesadas: resenas.length,
      },
      create: {
        productoId: productoId,
        resumenProducto: output.resumenProducto,
        resumenVendedor: output.resumenVendedor,
        resenasProcesadas: resenas.length,
      },
    });

    return resumenGuardado;
  } catch (error) {
    console.error(`[IA] Error al generar o guardar el resumen para ${productoId}:`, error);
    return null;
  }
}

/**
 * Dispara la generación del resumen de IA en segundo plano de forma no bloqueante
 * y deduplicada por productoId.
 */
export async function dispararGeneracionResumenBackground(productoId: string) {
  if (productosEnProceso.has(productoId)) {
    return;
  }

  productosEnProceso.add(productoId);

  // Ejecución desacoplada (fire-and-forget)
  void generarYGuardarResumenIA(productoId)
    .catch((err) => {
      console.error(
        `[IA-Background] Error procesando producto ${productoId}:`,
        err,
      );
    })
    .finally(() => {
      productosEnProceso.delete(productoId);
    });
}

/**
 * Consulta de solo lectura para el render de la página de producto.
 * Responde en pocos milisegundos sin bloquear el SSR con llamadas a Groq.
 * Si detecta que no hay resumen y existen reseñas, dispara la generación en background.
 */
export async function obtenerResumenYResenas(productoId: string) {
  try {
    const [resumenIA, resenasCrudas] = await Promise.all([
      prisma.resumenProductoIA.findUnique({ where: { productoId } }),
      obtenerResenasDelProducto(productoId),
    ]);

    // Si hay reseñas pero no hay resumen todavía, o si se superó el umbral de 5 reseñas nuevas,
    // se dispara la generación en background sin demorar este render.
    const procesadas = resumenIA?.resenasProcesadas ?? 0;
    const nuevas = resenasCrudas.length - procesadas;

    if ((!resumenIA && resenasCrudas.length > 0) || nuevas >= 5) {
      void dispararGeneracionResumenBackground(productoId);
    }

    return { resumenIA, resenasCrudas };
  } catch (error) {
    console.error("Error obteniendo datos de reseñas:", error);
    return { resumenIA: null, resenasCrudas: [] };
  }
}
