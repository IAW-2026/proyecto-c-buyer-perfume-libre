"use server";

import { prisma } from "@/lib/prisma";
import { Direccion } from "@/schema/direccion.schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function obtenerDireccionesUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const direcciones = await prisma.direccion.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: "desc" },
    });

    return direcciones;
  } catch (error) {
    console.error("Error en obtenerDireccionesUsuario:", error);
    throw new Error("No se pudo cargar el historial de direcciones");
  }
}

export async function agregarDireccion(datosDireccion: Direccion) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    await prisma.direccion.create({
      data: {
        usuarioId: userId,
        ...datosDireccion,
      },
    });

    revalidatePath("/checkout/envio");
  } catch (error) {
    console.error("Error en agregarDireccion:", error);
    throw new Error("No se pudo agregar la dirección");
  }
}

export async function eliminarDireccion(direccionId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    await prisma.direccion.deleteMany({
      where: { id: direccionId, usuarioId: userId },
    });

    revalidatePath("/checkout/envio");
  } catch (error) {
    console.error("Error en eliminarDireccion:", error);
    throw new Error("No se pudo eliminar la dirección");
  }
}

export async function editarDireccion(
  direccionId: string,
  datosDireccion: Direccion,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    await prisma.direccion.updateMany({
      where: { id: direccionId, usuarioId: userId },
      data: {
        ...datosDireccion,
      },
    });

    revalidatePath("/checkout/envio");
  } catch (error) {
    console.error("Error en editarDireccion:", error);
    throw new Error("No se pudo editar la dirección");
  }
}
