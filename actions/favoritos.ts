"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuthAction } from "@/lib/errors/safe-action";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domain-errors";
import { asegurarUsuario } from "./usuario";

export const toggleFavorito = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
  }),
  handler: async ({ productoId }, { userId }) => {
    await asegurarUsuario(userId);

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
      return { enFavoritos: false };
    } else {
      await prisma.favorito.create({
        data: {
          usuarioId: userId,
          productoId: productoId,
        },
      });

      revalidatePath(`/producto/${productoId}`, "page");
      revalidatePath("/");
      return { enFavoritos: true };
    }
  },
});

export const obtenerFavoritosDelUsuario = createAuthAction({
  handler: async (_input, { userId }) => {
    const favoritos = await prisma.favorito.findMany({
      where: {
        usuarioId: userId,
      },
      select: {
        productoId: true,
      },
    });

    return favoritos.map((fav) => fav.productoId);
  },
});

export const productoEstaEnFavoritos = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
  }),
  handler: async ({ productoId }, { userId }) => {
    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });

    return Boolean(favoritoExistente);
  },
});

export const eliminarFavorito = createAuthAction({
  schema: z.object({
    productoId: z.string().min(1, "El ID del producto es requerido"),
  }),
  handler: async ({ productoId }, { userId }) => {
    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: userId,
          productoId: productoId,
        },
      },
    });

    if (!favoritoExistente) {
      throw new NotFoundError("Favorito", productoId);
    }

    if (favoritoExistente.usuarioId !== userId) {
      throw new ForbiddenError("No puedes eliminar un favorito que no te pertenece");
    }

    await prisma.favorito.delete({
      where: {
        id: favoritoExistente.id,
      },
    });

    revalidatePath("/favoritos");
    return { eliminado: true };
  },
});
