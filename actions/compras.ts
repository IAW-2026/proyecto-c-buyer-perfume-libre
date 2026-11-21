"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { obtenerDetallePerfume } from "@/lib/api";
import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { Perfume } from "@/schema/perfume.schema";

export async function obtenerComprasDelUsuario() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const ordenes = await prisma.ordenCompra.findMany({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
        estado: true,
        total: true,
        items: {
          select: {
            id: true,
            productoId: true,
            nombre: true,
            marca: true,
            imagenUrl: true,
            vendedor: true,
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
            nombre: true,
            marca: true,
            imagenUrl: true,
            vendedor: true,
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

    // Identificar si existen ítems legacy sin snapshot descriptivo
    const itemsSinSnapshot = orden.items.filter(
      (item) => !item.nombre || !item.imagenUrl,
    );

    let legacyMap = new Map<string, Perfume | null>();
    if (itemsSinSnapshot.length > 0) {
      const uniqueLegacyIds = Array.from(
        new Set(itemsSinSnapshot.map((i) => i.productoId)),
      );
      const resultadosFallback = await Promise.all(
        uniqueLegacyIds.map(async (id) => {
          try {
            const producto = await obtenerDetallePerfume(id);
            return { id, producto };
          } catch {
            return { id, producto: null };
          }
        }),
      );
      legacyMap = new Map(resultadosFallback.map((r) => [r.id, r.producto]));
    }

    const itemsEnriquecidos = orden.items.map((item) => {
      // Si el ítem ya posee snapshot histórico, se utiliza directamente sin golpear la red
      if (item.nombre && item.imagenUrl) {
        return {
          ...item,
          producto: {
            id: item.productoId,
            nombre: item.nombre,
            marca: item.marca || "Desconocida",
            vendedor: item.vendedor || "Vendedor Oficial",
            imagenesUrl: [item.imagenUrl],
            precio: item.precio,
          },
        };
      }

      // Fallback para ítems legacy
      const productoFallback = legacyMap.get(item.productoId);
      return { ...item, producto: productoFallback || null };
    });

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
          vendedorId: true,
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
  nuevoEstado: EstadoOrden,
) {
  const userId = await requireUser();

  // Validar pertenencia: el usuario solo puede simular sobre su propia orden (a menos que sea ADMIN)
  const orden = await prisma.ordenCompra.findFirst({
    where: {
      id: ordenId,
      usuarioId: userId,
    },
  });

  if (!orden) {
    // Si no es el propietario, requerir rol ADMIN
    await requireAdmin();
  }

  const estadosValidos = Object.values(EstadoOrden);
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("Estado de orden inválido");
  }

  await prisma.ordenCompra.update({
    where: { id: ordenId },
    data: { estado: nuevoEstado },
  });

  revalidatePath(`/compras/${ordenId}?itemId=${itemId}`);
  return { success: true };
}
