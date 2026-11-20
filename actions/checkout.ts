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
import { requireAdmin, requireUser } from "@/lib/auth/guards";

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
    const usarApiReal = process.env.USE_REAL_API === "true";
    if (usarApiReal) {
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
    } else {
      vendedorId = "user_3EXlfKfNj061hH7lOCEhs7Wg7qy";
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
  // Solo administradores pueden alterar arbitrariamente el estado de una orden vía RPC
  const { userId } = await auth();
  if (userId) {
    await requireAdmin();
  }

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
    const { userId } = await auth();

    const orden = await prisma.ordenCompra.findUnique({
      where: { id: idOrden },
      include: {
        items: true,
      },
    });

    if (!orden) throw new Error("Orden no encontrada");

    // Si la llamada proviene de un usuario en sesión (RPC de cliente), validar pertenencia o rol admin
    if (userId && orden.usuarioId !== userId) {
      await requireAdmin();
    }

    const direccion = await prisma.direccion.findUnique({
      where: { id: orden.direccionId },
    });

    return { ...orden, direccion };
  } catch (error) {
    throw new Error(`Error al obtener la orden ${error}`);
  }
}

export async function verDetallesOrden(idOrden: string, usuarioId?: string) {
  try {
    const orden = await prisma.ordenCompra.findFirst({
      where: {
        id: idOrden,
        ...(usuarioId ? { usuarioId } : {}),
      },
      select: {
        id: true,
        usuarioId: true,
        vendedorId: true,
        total: true,
        estado: true,
      },
    });

    return orden;
  } catch (error) {
    throw new Error(`Error al obtener la orden ${error}`);
  }
}

export type ResultadoVerificacionOrdenPago =
  | {
      success: true;
      orden: {
        id: string;
        usuarioId: string;
        vendedorId: string;
        total: number;
        estado: EstadoOrden;
      };
    }
  | { success: false; status: 401 | 403 | 404 | 400 | 409; error: string };

export async function verificarOrdenParaPago(
  idOrden: string,
  usuarioId: string,
): Promise<ResultadoVerificacionOrdenPago> {
  if (!usuarioId) {
    return { success: false, status: 401, error: "No autorizado" };
  }

  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: idOrden },
      select: {
        id: true,
        usuarioId: true,
        vendedorId: true,
        total: true,
        estado: true,
      },
    });

    if (!orden) {
      return { success: false, status: 404, error: "Orden no encontrada" };
    }

    if (orden.usuarioId !== usuarioId) {
      return {
        success: false,
        status: 403,
        error: "No tienes permiso para operar sobre esta orden",
      };
    }

    if (orden.estado !== EstadoOrden.PENDIENTE) {
      return {
        success: false,
        status: 400,
        error: "Solo se pueden pagar órdenes en estado pendiente",
      };
    }

    return { success: true, orden };
  } catch (error) {
    throw new Error(`Error al verificar orden para pago: ${error}`);
  }
}

export async function aprobarOrden(idOrden: string, idPago: string) {
  // Transición atómica idempotente: solo avanza si la orden sigue en estado PENDIENTE.
  // Esto previene que una ejecución concurrente (POST de pago vs Webhook de MP) duplique envíos.
  const resultado = await prisma.ordenCompra.updateMany({
    where: {
      id: idOrden,
      estado: EstadoOrden.PENDIENTE,
    },
    data: {
      estado: EstadoOrden.PAGADO,
      pagoId: idPago,
    },
  });

  if (resultado.count === 0) {
    console.log(
      `[aprobarOrden] Orden ${idOrden} ya no está pendiente. Omitiendo duplicación de envío.`,
    );
    return { success: true, yaProcesada: true };
  }

  const orden = await obtenerOrden(idOrden);
  const calle = orden.direccion?.calle || "";

  const id_envio = await generarOrdenEnvio(
    idOrden,
    orden.usuarioId,
    calle,
    orden.items,
    {
      operador: orden.operadorEnvio,
      precio: orden.costoEnvio / 100,
      tipo_servicio: orden.servicioEnvio,
      demora_dias: orden.demoraDias,
    },
  );

  await prisma.ordenCompra.update({
    where: { id: idOrden },
    data: {
      envioId: id_envio,
    },
  });

  return { success: true, yaProcesada: false };
}

export async function rechazarOrden(idOrden: string, idPago: string) {
  // Transición atómica idempotente: solo avanza si sigue PENDIENTE
  const resultado = await prisma.ordenCompra.updateMany({
    where: {
      id: idOrden,
      estado: EstadoOrden.PENDIENTE,
    },
    data: {
      estado: EstadoOrden.CANCELADO,
      pagoId: idPago,
    },
  });

  if (resultado.count === 0) {
    console.log(
      `[rechazarOrden] Orden ${idOrden} ya no está pendiente. Omitiendo rechazo duplicado.`,
    );
    return { success: true, yaProcesada: true };
  }

  return { success: true, yaProcesada: false };
}

export async function vaciarCarrito(usuarioId: string) {
  const currentUserId = await requireUser();
  if (usuarioId !== currentUserId) {
    await requireAdmin();
  }

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
  fecha?: string,
) {
  void fecha;
  try {
    await prisma.ordenCompra.update({
      where: { envioId: trackingId },
      data: { estado: nuevoEstado },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      throw new Error(`NOT_FOUND`);
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al actualizar el estado del envío ${message}`);
  }
}

export async function obtenerItemsOrdenParaSeller(ordenId: string) {
  const { userId } = await auth();
  if (userId) {
    const ordenUsuario = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      select: { usuarioId: true },
    });
    if (!ordenUsuario) throw new Error("NOT_FOUND");
    if (ordenUsuario.usuarioId !== userId) {
      await requireAdmin();
    }
  }

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
