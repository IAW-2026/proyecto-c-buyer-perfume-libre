"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

export async function agregarAlCarrito(productoId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const favoritoExistente = await prisma.carrito.upsert({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
      create: {
        usuarioId: userId,
        productoId: productoId,
        cantidad: 1,
      },
      update: {},
    });
  } catch (error) {
    console.error("Error en agregarAlCarrito:", error);
    throw new Error("No se pudo agregar el producto al carrito");
  }
}

export async function eliminarDelCarrito(productoId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    await prisma.carrito.delete({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });
  } catch (error) {
    console.error("Error en eliminarDelCarrito:", error);
    throw new Error("No se pudo eliminar el producto del carrito");
  }

  revalidatePath("/carrito");
}

export async function obtenerCarritoDelUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

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
  } catch (error) {
    console.error("Error en obtenerCarritoDelUsuario:", error);
    throw new Error("No se pudieron obtener los productos del carrito");
  }
}

export async function actualizarCantidadEnCarrito(
  productoId: string,
  nuevaCantidad: number,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const carritoItem = await prisma.carrito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!carritoItem) {
      throw new Error("Producto no encontrado en el carrito");
    }

    await prisma.carrito.update({
      where: {
        id: carritoItem.id,
      },
      data: {
        cantidad: nuevaCantidad,
      },
    });
  } catch (error) {
    console.error("Error en actualizarCantidadEnCarrito:", error);
    throw new Error(
      "No se pudo actualizar la cantidad del producto en el carrito",
    );
  }

  revalidatePath("/carrito");
}
