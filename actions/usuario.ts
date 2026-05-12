"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function sincronizarUsuario() {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const usuarioDB = await prisma.usuario.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
      },
    });
  } catch (error) {
    console.error("Error al sincronizar el usuario:", error);
    throw new Error("Error al sincronizar el usuario");
  }
}
