"use server";

import { RolUsuario } from "@/lib/generated/prisma/client";
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

export async function actualizarRol(usuarioId: string, nuevoRol: RolUsuario) {
  try {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { rol: nuevoRol },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Error al actualizar el rol del usuario");
  }
}

export async function obtenerRolUsuario() {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const rolUsuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { rol: true },
    });

    if (!rolUsuario) {
      throw new Error("Usuario no encontrado en la base de datos");
    }

    return rolUsuario;
  } catch (error) {
    null;
  }
}
