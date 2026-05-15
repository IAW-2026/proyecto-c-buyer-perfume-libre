"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

export async function aumentarCantidadEnCarrito(productoId: string) {
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
        cantidad: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error en aumentarCantidadEnCarrito:", error);
    throw new Error(
      "No se pudo aumentar la cantidad del producto en el carrito",
    );
  }
}

export async function decrementarCantidadEnCarrito(productoId: string) {
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
        cantidad: true,
        id: true,
      },
    });

    if (!carritoItem) {
      throw new Error("Producto no encontrado en el carrito");
    }

    if (carritoItem.cantidad <= 1) {
      throw new Error(
        "No se puede decrementar. Usa el botón eliminar para remover el producto",
      );
    }

    await prisma.carrito.update({
      where: {
        id: carritoItem.id,
      },
      data: {
        cantidad: {
          decrement: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error en decrementarCantidadEnCarrito:", error);
    throw error;
  }
}
