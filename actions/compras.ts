"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { obtenerDetallePerfume } from "@/lib/api";
import { EstadosOrden, ItemCarrito } from "@/schema/perfume.schema";

export async function obtenerComprasDelUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const ordenes = await prisma.ordenCompra.findMany({
      where: {
        usuarioId: userId,
        estado: { not: EstadosOrden.enum.Pendiente },
      },
      select: {
        id: true,
        estado: true,
        total: true,
        items: {
          select: {
            id: true,
            productoId: true,
            precio: true,
            cantidad: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ordenes;
  } catch (error) {
    console.error("Error en obtenerHistorialDeOrdenes:", error);
    throw new Error("No se pudo cargar el historial de compras");
  }
}

export async function verDetallesCompra(ordenId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

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
            precio: true,
            cantidad: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!orden) {
      throw new Error("Orden no encontrada");
    }

    // Enriquecer cada item con los detalles del producto desde la API externa
    const itemsEnriquecidos = await Promise.all(
      orden.items.map(async (item) => {
        try {
          const producto = await obtenerDetallePerfume(item.productoId);
          return { ...item, producto };
        } catch (e) {
          // Si no se encuentra el producto, devolvemos el item sin detalles
          return { ...item, producto: null };
        }
      }),
    );

    return { ...orden, items: itemsEnriquecidos };
  } catch (error) {
    console.error("Error en verDetallesCompra:", error);
    throw new Error("No se pudo cargar los detalles de la compra");
  }
}

export async function obtenerDetalleCompra(ordenId: string) {
  const { userId } = await auth();

  if (!userId) return null;

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

  if (!orden) return null;

  return orden;
}

export async function obtenerItemDeOrden(ordenId: string, itemId: string) {
  const { userId } = await auth();
  if (!userId) return null;

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
        },
      },
    },
  });

  return itemOrden;
}

export async function obtenerCantidadDeProductosComprados(ordenId: string) {
  const { userId } = await auth();
  if (!userId) return null;

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

export async function simularCambioEstado(
  ordenId: string,
  itemId: string,
  nuevoEstado: string,
) {
  console.log(
    "Se entro a simular cambio con: " +
      ordenId +
      " - " +
      itemId +
      " - " +
      nuevoEstado,
  );
  await prisma.ordenCompra.update({
    where: { id: ordenId },
    data: { estado: nuevoEstado },
  });

  revalidatePath(`/compras/${ordenId}?itemId=${itemId}`);
}
