"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { createAuthAction } from "@/lib/errors/safe-action";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "@/lib/errors/domain-errors";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { dispararGeneracionResumenBackground } from "./resumen-ia";

const UMBRAL_ACTUALIZACION_RESUMEN = 5;

/**
 * Server Action protegida para calificar un producto de una orden entregada.
 * - Verifica autenticación (inyecta userId).
 * - Verifica propiedad de la orden.
 * - Exige estado ENTREGADO.
 * - Asegura que el producto pertenezca a la orden.
 * - Impide calificaciones duplicadas (1 reseña por producto por orden).
 * - Dispara en background la actualización de IA si se acumulan 5 reseñas nuevas o no hay resumen.
 */
export const crearResenaProducto = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "ID de producto requerido"),
    ordenId: z.string().min(1, "ID de orden requerido"),
    rating: z
      .number()
      .int()
      .min(1, "La calificación mínima es 1")
      .max(5, "La calificación máxima es 5"),
    comentario: z
      .string()
      .max(1000, "El comentario no puede superar los 1000 caracteres")
      .optional(),
  }),
  handler: async ({ productoId, ordenId, rating, comentario }, ctx) => {
    // 1. Verificar orden
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      include: { items: true },
    });

    if (!orden) {
      throw new NotFoundError("Orden de compra", ordenId);
    }

    if (orden.usuarioId !== ctx.userId) {
      throw new ForbiddenError("No tienes permiso para calificar esta orden");
    }

    if (orden.estado !== EstadoOrden.ENTREGADO) {
      throw new ValidationError(
        "Solo puedes calificar productos de órdenes que ya hayan sido entregadas",
      );
    }

    // 2. Verificar que el producto fue comprado en esta orden
    const itemEncontrado = orden.items.find(
      (item) => item.productoId === productoId,
    );
    if (!itemEncontrado) {
      throw new ValidationError(
        "El producto especificado no forma parte de esta compra",
      );
    }

    // 3. Verificar que no exista calificación previa para este producto en esta orden
    const existente = await prisma.resenaProducto.findUnique({
      where: {
        usuarioId_ordenCompraId_productoId: {
          usuarioId: ctx.userId,
          ordenCompraId: ordenId,
          productoId,
        },
      },
    });

    if (existente) {
      throw new ConflictError(
        "Ya has calificado este producto para esta orden de compra",
      );
    }

    // 4. Crear reseña en la base de datos
    const nuevaResena = await prisma.resenaProducto.create({
      data: {
        usuarioId: ctx.userId,
        ordenCompraId: ordenId,
        productoId,
        puntuacion: rating,
        comentario: comentario?.trim() || null,
      },
    });

    // 5. Verificar si dispara actualización del resumen IA (primera vez o cada 5 reseñas)
    try {
      const [totalResenas, resumenActual] = await Promise.all([
        prisma.resenaProducto.count({ where: { productoId } }),
        prisma.resumenProductoIA.findUnique({ where: { productoId } }),
      ]);

      const procesadas = resumenActual?.resenasProcesadas ?? 0;
      const resenasNuevas = totalResenas - procesadas;

      if (!resumenActual || resenasNuevas >= UMBRAL_ACTUALIZACION_RESUMEN) {
        void dispararGeneracionResumenBackground(productoId);
      }
    } catch (e) {
      console.error("[Reseñas] Error al chequear umbral de IA:", e);
    }

    revalidatePath(`/producto/${productoId}`);
    revalidatePath(`/compras/${ordenId}`);

    return {
      mensaje: "¡Gracias por tu reseña!",
      id: nuevaResena.id,
    };
  },
});

/**
 * Server Action protegida para calificar al vendedor de una orden entregada.
 * - Exige rol autenticado.
 * - Verifica pertenencia de la orden y estado ENTREGADO.
 * - Impide calificar al vendedor más de una vez por orden.
 */
export const crearResenaVendedor = createAuthAction({
  schema: z.object({
    vendedorId: z.string().min(1, "ID de vendedor requerido"),
    ordenId: z.string().min(1, "ID de orden requerido"),
    rating: z
      .number()
      .int()
      .min(1, "La calificación mínima es 1")
      .max(5, "La calificación máxima es 5"),
    comentario: z
      .string()
      .max(1000, "El comentario no puede superar los 1000 caracteres")
      .optional(),
  }),
  handler: async ({ vendedorId, ordenId, rating, comentario }, ctx) => {
    // 1. Verificar orden
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundError("Orden de compra", ordenId);
    }

    if (orden.usuarioId !== ctx.userId) {
      throw new ForbiddenError("No tienes permiso para calificar esta orden");
    }

    if (orden.estado !== EstadoOrden.ENTREGADO) {
      throw new ValidationError(
        "Solo puedes calificar al vendedor una vez recibido el pedido",
      );
    }

    if (orden.vendedorId !== vendedorId) {
      throw new ValidationError(
        "El vendedor especificado no coincide con el de la orden",
      );
    }

    // 2. Verificar duplicado
    const existente = await prisma.resenaVendedor.findUnique({
      where: {
        usuarioId_ordenCompraId_vendedorId: {
          usuarioId: ctx.userId,
          ordenCompraId: ordenId,
          vendedorId,
        },
      },
    });

    if (existente) {
      throw new ConflictError(
        "Ya has calificado a este vendedor para esta orden de compra",
      );
    }

    // 3. Crear reseña
    const nuevaResena = await prisma.resenaVendedor.create({
      data: {
        usuarioId: ctx.userId,
        ordenCompraId: ordenId,
        vendedorId,
        puntuacion: rating,
        comentario: comentario?.trim() || null,
      },
    });

    revalidatePath(`/compras/${ordenId}`);

    return {
      mensaje: "¡Gracias por calificar la atención del vendedor!",
      id: nuevaResena.id,
    };
  },
});

/**
 * Consulta el estado previo de reseñas de un usuario para una orden dada.
 * Permite que la UI muestre de inmediato si el producto o el vendedor ya fueron calificados.
 */
export async function obtenerEstadoResenasOrden(
  ordenId: string,
  productoId: string,
  vendedorId: string,
) {
  try {
    const userId = await requireUser();

    const [resenaProd, resenaVend] = await Promise.all([
      prisma.resenaProducto.findUnique({
        where: {
          usuarioId_ordenCompraId_productoId: {
            usuarioId: userId,
            ordenCompraId: ordenId,
            productoId,
          },
        },
      }),
      prisma.resenaVendedor.findUnique({
        where: {
          usuarioId_ordenCompraId_vendedorId: {
            usuarioId: userId,
            ordenCompraId: ordenId,
            vendedorId,
          },
        },
      }),
    ]);

    return {
      yaResenadoProducto: !!resenaProd,
      yaResenadoVendedor: !!resenaVend,
      calificacionProducto: resenaProd
        ? {
            puntuacion: resenaProd.puntuacion,
            comentario: resenaProd.comentario,
            fecha: resenaProd.createdAt.toISOString(),
          }
        : null,
      calificacionVendedor: resenaVend
        ? {
            puntuacion: resenaVend.puntuacion,
            comentario: resenaVend.comentario,
            fecha: resenaVend.createdAt.toISOString(),
          }
        : null,
    };
  } catch {
    return {
      yaResenadoProducto: false,
      yaResenadoVendedor: false,
      calificacionProducto: null,
      calificacionVendedor: null,
    };
  }
}

/**
 * Adaptadores de compatibilidad hacia atrás para llamadas legacy.
 */
export async function enviarResenaProductoReal(
  productoId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
  _imagenes?: string[],
) {
  void _imagenes;
  return crearResenaProducto({
    productoId,
    ordenId,
    rating,
    comentario,
  });
}

export async function enviarResenaVendedorReal(
  vendedorId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  return crearResenaVendedor({
    vendedorId,
    ordenId,
    rating,
    comentario,
  });
}

