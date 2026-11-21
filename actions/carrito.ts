"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuthAction } from "@/lib/errors/safe-action";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domain-errors";
import { asegurarUsuario } from "./usuario";

export const agregarAlCarrito = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
    cantidad: z.number().int().min(1, "La cantidad mínima es 1").optional().default(1),
  }),
  handler: async ({ productoId, cantidad }, { userId }) => {
    await asegurarUsuario(userId);

    const item = await prisma.carrito.upsert({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
      create: {
        usuarioId: userId,
        productoId: productoId,
        cantidad: cantidad ?? 1,
      },
      update: {
        ...(cantidad && cantidad > 1 ? { cantidad: { increment: cantidad } } : {}),
      },
    });

    revalidatePath("/carrito");
    return { id: item.id, productoId: item.productoId, cantidad: item.cantidad };
  },
});

export const eliminarDelCarrito = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
  }),
  handler: async ({ productoId }, { userId }) => {
    const item = await prisma.carrito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });

    if (!item) {
      throw new NotFoundError("Producto en el carrito", productoId);
    }

    if (item.usuarioId !== userId) {
      throw new ForbiddenError("No puedes eliminar un producto de otro carrito");
    }

    await prisma.carrito.delete({
      where: {
        id: item.id,
      },
    });

    revalidatePath("/carrito");
    return { eliminado: true };
  },
});

export const obtenerCarritoDelUsuario = createAuthAction({
  handler: async (_input, { userId }) => {
    const carrito = await prisma.carrito.findMany({
      where: {
        usuarioId: userId,
      },
      select: {
        productoId: true,
        cantidad: true,
      },
    });

    return carrito.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
    }));
  },
});

export const actualizarCantidadEnCarrito = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
    nuevaCantidad: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  }),
  handler: async ({ productoId, nuevaCantidad }, { userId }) => {
    const carritoItem = await prisma.carrito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
      select: {
        id: true,
        usuarioId: true,
      },
    });

    if (!carritoItem) {
      throw new NotFoundError("Producto en el carrito", productoId);
    }

    if (carritoItem.usuarioId !== userId) {
      throw new ForbiddenError("No puedes modificar el carrito de otro usuario");
    }

    await prisma.carrito.update({
      where: {
        id: carritoItem.id,
      },
      data: {
        cantidad: nuevaCantidad,
      },
    });

    revalidatePath("/carrito");
    return { actualizado: true, nuevaCantidad };
  },
});
