"use server";

import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerResenasDelProducto } from "@/lib/mockResenas";

export async function generarYGuardarResumenIA(productoId: string) {
  try {
    const resenas = await obtenerResenasDelProducto(productoId);

    if (!resenas || resenas.length === 0) {
      return null;
    }

    const textoResenas = resenas
      .map((r) => `[Rating: ${r.rating}/5] - ${r.comentario}`)
      .join("\n");

    const prompt = `
      Sos un analista experto en e-commerce. Analiza las siguientes reseñas de un perfume vendido en un marketplace C2C.
      Extrae los patrones principales y devuelve un resumen ultra conciso para el comprador.
      
      Reglas estrictas:
      - Máximo 15 palabras para el resumen del producto.
      - Máximo 15 palabras para el resumen del vendedor.
      - Tono neutral y directo. Cero formalidades exageradas.

      Reseñas a analizar:
      ${textoResenas}
    `;

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
    console.error("Error al generar o guardar el resumen de IA:", error);
    throw new Error("Fallo en la integración con IA");
  }
}

export async function obtenerResumenYResenas(productoId: string) {
  try {
    let resumenIA;

    const [resultadoIA, resenasCrudas] = await Promise.all([
      prisma.resumenProductoIA.findUnique({ where: { productoId } }),
      obtenerResenasDelProducto(productoId),
    ]);

    resumenIA = resultadoIA;

    if (!resultadoIA && resenasCrudas && resenasCrudas.length > 0) {
      const nuevoResumen = await generarYGuardarResumenIA(productoId);
      resumenIA = nuevoResumen;
    }

    return { resumenIA, resenasCrudas };
  } catch (error) {
    console.error("Error obteniendo datos de reseñas:", error);
    return { resumenIA: null, resenasCrudas: [] };
  }
}
