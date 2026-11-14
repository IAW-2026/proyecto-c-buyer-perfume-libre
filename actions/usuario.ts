"use server";

import { RolUsuario } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function asegurarUsuario(userId: string) {
  try {
    return await prisma.usuario.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        rol: RolUsuario.USER,
      },
    });
  } catch (error) {
    console.error("Error en asegurarUsuario:", error);
    return await prisma.usuario.findUnique({
      where: { id: userId },
    });
  }
}

export async function sincronizarUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    await asegurarUsuario(userId);
  } catch (error) {
    console.error("Error al sincronizar el usuario:", error);
    throw new Error("Error al sincronizar el usuario");
  }
}

export async function actualizarRol(usuarioId: string, nuevoRol: RolUsuario) {
  try {
    await prisma.usuario.upsert({
      where: { id: usuarioId },
      update: { rol: nuevoRol },
      create: {
        id: usuarioId,
        rol: nuevoRol,
      },
    });

    const client = await clerkClient();
    await client.users.updateUserMetadata(usuarioId, {
      publicMetadata: {
        rol: nuevoRol,
      },
    });
  } catch (error: unknown) {
    console.error("Error al actualizar rol:", error);
    throw new Error("Error al actualizar el rol del usuario");
  }
}

export async function obtenerRolUsuario() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return null;
    }

    const rolClaim = sessionClaims?.metadata?.rol;
    if (rolClaim) {
      return { rol: rolClaim as RolUsuario };
    }

    const rolUsuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    return rolUsuario;
  } catch (error) {
    return null;
  }
}
