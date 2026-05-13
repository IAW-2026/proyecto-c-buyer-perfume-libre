"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorito(productoId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });

    if (favoritoExistente) {
      await prisma.favorito.delete({
        where: {
          id: favoritoExistente.id,
        },
      });
      revalidatePath(`/producto/${productoId}`, "page");
      revalidatePath("/");
    } else {
      await prisma.favorito.create({
        data: {
          usuarioId: userId,
          productoId: productoId,
        },
      });
      revalidatePath(`/producto/${productoId}`, "page");
      revalidatePath("/");
    }
  } catch (error) {
    console.error("Error en toggleFavorito:", error);
    throw new Error("No se pudo actualizar el estado de favoritos");
  }
}

export async function obtenerFavoritosDelUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const favoritos = await prisma.favorito.findMany({
      where: {
        usuarioId: userId,
      },
      select: {
        productoId: true,
      },
    });

    return favoritos.map((fav) => fav.productoId);
  } catch (error) {
    console.error("Error en obtenerFavoritosDelUsuario:", error);
    throw new Error("No se pudieron obtener los favoritos del usuario");
  }
}

export async function productoEstaEnFavoritos(productoId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });

    if (favoritoExistente) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error en productoEstaEnFavoritos:", error);
    throw new Error("No se pudo verificar si el producto está en favoritos");
  }
}
