"use server";

import {
  fetchProductoDesdeSeller,
  generarOrdenEnvio,
  obtenerPreciosDeProductos,
} from "@/lib/api";
import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { OpcionEnvio } from "@/lib/mockEnvios";
import { prisma } from "@/lib/prisma";
import { EstadosOrden } from "@/schema/perfume.schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { asegurarUsuario } from "./usuario";

export async function iniciarProcesamientoCompra(
  direccionId: string,
  datosEnvio: OpcionEnvio,
  productosIds: string[],
  esCompraDirecta: boolean,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  await asegurarUsuario(userId);

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
    }, 0) +
    datosEnvio.precio * 100;

  let vendedorId = "vendedor_generico";
  if (itemsAProcesar.length > 0) {
    try {
      const productoData = await fetchProductoDesdeSeller(
        itemsAProcesar[0].productoId,
      );
      if (productoData && productoData.vendedor?.clerk_id) {
        vendedorId = String(productoData.vendedor.clerk_id);
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
      estado: EstadosOrden.enum.PENDIENTE,
      costoEnvio: datosEnvio.precio * 100,
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
  estado: EstadoOrden | EstadoOrden[],
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
  estado: EstadoOrden,
  idPago?: string,
  idEnvio?: string,
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

export async function verDetallesOrden(idOrden: string) {
  try {
    const orden = await prisma.ordenCompra.findFirst({
      where: { id: idOrden },
      select: {
        id: true,
        vendedorId: true,
        total: true,
      },
    });

    return orden;
  } catch (error) {
    throw new Error(`Error al obtener la orden ${error}`);
  }
}

export async function aprobarOrden(idOrden: string, idPago: string) {
  const orden = await obtenerOrden(idOrden);

  const id_envio = await generarOrdenEnvio(
    idOrden,
    orden.usuarioId,
    orden.direccion?.calle!,
    orden.items,
    {
      operador: orden.operadorEnvio,
      precio: orden.costoEnvio / 100,
      tipo_servicio: orden.servicioEnvio,
      demora_dias: orden.demoraDias,
    },
  );

  await actualizarOrden(idOrden, EstadosOrden.enum.PAGADO, idPago, id_envio);
}

export async function rechazarOrden(idOrden: string, idPago: string) {
  await actualizarOrden(
    idOrden,
    EstadosOrden.enum.CANCELADO,
    idPago,
    undefined,
  );
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
  nuevoEstado: EstadoOrden,
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

export async function obtenerEstadoOrden(paymentId: string) {
  try {
    const orden = await prisma.ordenCompra.findFirst({
      where: {
        id: paymentId,
      },
      select: {
        estado: true,
      },
    });

    return orden;
  } catch (error) {
    throw new Error(`Error al obtener el estado de la orden ${error}`);
  }
}
