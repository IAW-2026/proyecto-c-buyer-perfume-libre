"use server";

import { fetchProductoDesdeSeller, obtenerPreciosDeProductos } from "@/lib/api";
import { OpcionEnvio } from "@/lib/mockEnvios";
import { prisma } from "@/lib/prisma";
import { EstadosOrden } from "@/schema/perfume.schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function iniciarProcesamientoCompra(
  direccionId: string,
  datosEnvio: OpcionEnvio,
  productosIds: string[],
  esCompraDirecta: boolean,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  if (!productosIds || productosIds.length === 0) {
    throw new Error("No hay productos seleccionados para comprar");
  }

  let itemsAProcesar: { productoId: string; cantidad: number }[] = [];

  if (esCompraDirecta) {
    itemsAProcesar = [{ productoId: productosIds[0], cantidad: 1 }];
  } else {
    const itemsCarrito = await prisma.carrito.findMany({
      where: {
        usuarioId: userId,
        productoId: { in: productosIds },
      },
    });

    if (itemsCarrito.length === 0) {
      throw new Error("Los productos seleccionados ya no están en el carrito");
    }

    itemsAProcesar = itemsCarrito.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
    }));
  }

  const idsProductos = itemsAProcesar.map((item) => item.productoId);
  const preciosProductos = await obtenerPreciosDeProductos(idsProductos);

  const obtenerPrecio = (id: string) =>
    preciosProductos.find((p) => p.id === id)?.precio || 0;

  const total =
    itemsAProcesar.reduce((acc, item) => {
      return acc + obtenerPrecio(item.productoId) * item.cantidad;
    }, 0) + datosEnvio.precio;

  let vendedorId = "vendedor_generico";

  if (itemsAProcesar.length > 0) {
    try {
      const productoData = await fetchProductoDesdeSeller(
        itemsAProcesar[0].productoId,
      );

      if (productoData && productoData.vendedor?.vendedor_id) {
        vendedorId = String(productoData.vendedor.vendedor_id);
      }
    } catch (error) {
      console.warn(
        "No pudimos contactar a Seller App para obtener el vendedor, usando genérico:",
        error,
      );
    }
  }

  const nuevaOrden = await prisma.ordenCompra.create({
    data: {
      usuarioId: userId,
      estado: EstadosOrden.enum.Pendiente,
      costoEnvio: datosEnvio.precio,
      vendedorId: vendedorId,
      operadorEnvio: datosEnvio.operador,
      servicioEnvio: datosEnvio.tipo_servicio,
      demoraDias: datosEnvio.demora_dias,
      direccionId: direccionId,
      total: total,
      items: {
        create: itemsAProcesar.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: obtenerPrecio(item.productoId),
        })),
      },
    },
  });

  if (!esCompraDirecta) {
    await prisma.carrito.deleteMany({
      where: {
        usuarioId: userId,
        productoId: { in: productosIds },
      },
    });
  }

  redirect(`/checkout/confirmacion?ordenId=${nuevaOrden.id}`);
}

export async function obtenerOrdenDeUsuario(
  idOrden: string,
  estado: string | string[],
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const orden = await prisma.ordenCompra.findFirst({
      where: {
        id: idOrden,
        usuarioId: userId,
        estado: Array.isArray(estado) ? { in: estado } : estado,
      },
      include: {
        items: true,
      },
    });

    if (!orden) throw new Error("Orden no encontrada");

    return orden;
  } catch (error) {
    throw new Error(`Error al obtener la orden ${error}`);
  }
}

export async function actualizarOrden(
  idOrden: string,
  idPago: string,
  idEnvio: string,
  estado: string,
) {
  try {
    await prisma.ordenCompra.update({
      where: { id: idOrden },
      data: {
        estado: estado,
        pagoId: idPago,
        envioId: idEnvio,
      },
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al actualizar la orden ${error}`);
  }
}

export async function obtenerOrden(idOrden: string) {
  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: idOrden },
      include: {
        items: true,
      },
    });

    if (!orden) throw new Error("Orden no encontrada");

    const direccion = await prisma.direccion.findUnique({
      where: { id: orden.direccionId },
    });

    return { ...orden, direccion };
  } catch (error) {
    throw new Error(`Error al obtener la orden ${error}`);
  }
}

export async function vaciarCarrito(usuarioId: string) {
  try {
    await prisma.carrito.deleteMany({
      where: { usuarioId },
    });
  } catch (error) {
    throw new Error(`Error al vaciar el carrito ${error}`);
  }
}

export async function actualizarEstadoEnvio(
  trackingId: string,
  nuevoEstado: string,
  fecha: string,
) {
  try {
    const orden = await prisma.ordenCompra.update({
      where: { envioId: trackingId },
      data: { estado: nuevoEstado },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error(`NOT_FOUND`);
    }

    throw new Error(`Error al actualizar el estado del envío ${error.message}`);
  }
}

export async function obtenerItemsOrdenParaSeller(ordenId: string) {
  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      select: {
        usuarioId: true,
        items: {
          select: {
            productoId: true,
            cantidad: true,
          },
        },
      },
    });

    if (!orden) throw new Error("NOT_FOUND");

    return orden;
  } catch (error) {
    throw new Error(`Error al obtener los items de la orden ${error}`);
  }
}
