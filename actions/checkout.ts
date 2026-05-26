"use server";

import { obtenerPreciosDeProductos } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { EstadosOrden } from "@/schema/perfume.schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function iniciarProcesamientoCompra(direccionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const itemsCarrito = await prisma.carrito.findMany({
    where: { usuarioId: userId },
  });

  if (itemsCarrito.length === 0) throw new Error("El carrito está vacío");

  const direccion = await prisma.direccion.findUnique({
    where: { id: direccionId, usuarioId: userId },
    select: {
      codigoPostal: true,
      calle: true,
    },
  });

  if (!direccion) throw new Error("Dirección no encontrada");

  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const costoEnvioSimulado = Math.floor(Math.random() * 2500); // Entre $0 y $25.00 en centavos

  const idsProductos = itemsCarrito.map((item) => item.productoId);
  const preciosProductos = await obtenerPreciosDeProductos(idsProductos);
  const total = itemsCarrito.reduce((acc, item) => {
    const precioUnitario =
      preciosProductos.find((p) => p.id === item.productoId)?.precio || 0;
    return acc + precioUnitario * item.cantidad;
  }, 0);

  const nuevaOrden = await prisma.ordenCompra.create({
    data: {
      usuarioId: userId,
      estado: EstadosOrden.enum.Pendiente,
      costoEnvio: costoEnvioSimulado,
      total: total,
      items: {
        create: itemsCarrito.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio:
            preciosProductos.find((p) => p.id === item.productoId)?.precio || 0,
        })),
      },
    },
  });

  redirect(`/checkout/confirmacion?ordenId=${nuevaOrden.id}`);
}

export async function actualizarOrden(
  idOrden: string,
  idPago: string,
  estado: string,
) {
  try {
    await prisma.ordenCompra.update({
      where: { id: idOrden },
      data: {
        estado: estado,
        pagoId: idPago,
      },
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al actualizar la orden ${error}`);
  }
}
