"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerDetallePerfume } from "@/lib/api";
import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { requireUser } from "@/lib/auth/guards";
import { createAdminAction } from "@/lib/errors/safe-action";
import { NotFoundError } from "@/lib/errors/domain-errors";
import { Perfume } from "@/schema/perfume.schema";

/**
 * Consulta del historial de órdenes del usuario autenticado en la base de datos.
 */
export async function obtenerComprasDelUsuario() {
  const userId = await requireUser();

  return await prisma.ordenCompra.findMany({
    where: {
      usuarioId: userId,
    },
    select: {
      id: true,
      estado: true,
      total: true,
      items: {
        select: {
          id: true,
          productoId: true,
          nombre: true,
          marca: true,
          imagenUrl: true,
          vendedor: true,
          precio: true,
          cantidad: true,
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Obtiene los detalles de una compra específica con soporte para snapshots históricos
 * y fallback resiliente para órdenes legacy.
 */
export async function verDetallesCompra(ordenId: string) {
  const userId = await requireUser();

  const orden = await prisma.ordenCompra.findFirst({
    where: { id: ordenId, usuarioId: userId },
    select: {
      id: true,
      estado: true,
      total: true,
      items: {
        select: {
          id: true,
          productoId: true,
          nombre: true,
          marca: true,
          imagenUrl: true,
          vendedor: true,
          precio: true,
          cantidad: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!orden) {
    throw new NotFoundError("Orden", ordenId);
  }

  // Identificar si existen ítems legacy sin snapshot descriptivo
  const itemsSinSnapshot = orden.items.filter(
    (item) => !item.nombre || !item.imagenUrl,
  );

  let legacyMap = new Map<string, Perfume | null>();
  if (itemsSinSnapshot.length > 0) {
    const uniqueLegacyIds = Array.from(
      new Set(itemsSinSnapshot.map((i) => i.productoId)),
    );
    const resultadosFallback = await Promise.all(
      uniqueLegacyIds.map(async (id) => {
        try {
          const producto = await obtenerDetallePerfume(id);
          return { id, producto };
        } catch {
          return { id, producto: null };
        }
      }),
    );
    legacyMap = new Map(resultadosFallback.map((r) => [r.id, r.producto]));
  }

  const itemsEnriquecidos = orden.items.map((item) => {
    // Si el ítem ya posee snapshot histórico, se utiliza directamente sin golpear la red
    if (item.nombre && item.imagenUrl) {
      return {
        ...item,
        producto: {
          id: item.productoId,
          nombre: item.nombre,
          marca: item.marca || "Desconocida",
          vendedor: item.vendedor || "Vendedor Oficial",
          imagenesUrl: [item.imagenUrl],
          precio: item.precio,
        },
      };
    }

    // Fallback para ítems legacy
    const productoFallback = legacyMap.get(item.productoId);
    return { ...item, producto: productoFallback || null };
  });

  return { ...orden, items: itemsEnriquecidos };
}

export async function obtenerDetalleCompra(ordenId: string) {
  const userId = await requireUser();

  const orden = await prisma.ordenCompra.findFirst({
    where: { id: ordenId, usuarioId: userId },
    select: {
      id: true,
      estado: true,
      createdAt: true,
      envioId: true,
      pagoId: true,
    },
  });

  if (!orden) {
    throw new NotFoundError("Orden", ordenId);
  }

  return orden;
}

export async function obtenerItemDeOrden(ordenId: string, itemId: string) {
  const userId = await requireUser();

  const itemOrden = await prisma.itemOrdenCompra.findFirst({
    where: {
      id: itemId,
      ordenCompraId: ordenId,
      ordenCompra: {
        usuarioId: userId,
      },
    },
    include: {
      ordenCompra: {
        select: {
          usuarioId: true,
          pagoId: true,
          envioId: true,
          estado: true,
          createdAt: true,
          costoEnvio: true,
          total: true,
          vendedorId: true,
        },
      },
    },
  });

  return itemOrden;
}

export async function obtenerCantidadDeProductosComprados(ordenId: string) {
  const userId = await requireUser();

  const cantidadComprados = await prisma.itemOrdenCompra.aggregate({
    where: {
      ordenCompraId: ordenId,
      ordenCompra: {
        usuarioId: userId,
      },
    },
    _sum: {
      cantidad: true,
    },
  });

  return cantidadComprados._sum.cantidad;
}

/**
 * Server Action protegida con rol ADMIN para simulación y pruebas controladas de envíos.
 * Valida los parámetros con Zod y asegura que no pueda ser invocada por compradores ordinarios.
 */
export const simularCambioEstado = createAdminAction({
  schema: z.object({
    ordenId: z.string().min(1, "ID de orden requerido"),
    itemId: z.string().min(1, "ID de ítem requerido"),
    nuevoEstado: z.nativeEnum(EstadoOrden),
  }),
  handler: async ({ ordenId, itemId, nuevoEstado }) => {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundError("Orden de compra", ordenId);
    }

    await prisma.ordenCompra.update({
      where: { id: ordenId },
      data: { estado: nuevoEstado },
    });

    revalidatePath(`/compras/${ordenId}?itemId=${itemId}`);
    revalidatePath(`/admin/ordenes/${ordenId}`);
    return { success: true, nuevoEstado };
  },
});
