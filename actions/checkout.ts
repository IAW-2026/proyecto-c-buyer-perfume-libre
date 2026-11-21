"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { EstadoOrden, Prisma } from "@/lib/generated/prisma/client";
import { EstadosOrden } from "@/schema/perfume.schema";
import { prisma } from "@/lib/prisma";
import { generarOrdenEnvio, obtenerSnapshotsProductos } from "@/lib/api";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { createAuthAction } from "@/lib/errors/safe-action";
import {
  NotFoundError,
  ConflictError,
} from "@/lib/errors/domain-errors";
import { asegurarUsuario } from "./usuario";

/**
 * Server Action autenticada para iniciar la compra desde el panel de checkout.
 * Valida dirección, pertenencia, productos y métodos de envío.
 * Crea atómicamente la OrdenCompra con snapshots descriptivos y redirige a confirmación.
 */
export const iniciarProcesamientoCompra = createAuthAction({
  schema: z.object({
    direccionId: z.string().min(1, "ID de dirección requerido"),
    datosEnvio: z.object({
      operador: z.string().min(1, "Operador de envío requerido"),
      tipo_servicio: z.string().min(1, "Tipo de servicio requerido"),
      precio: z.number().min(0, "El precio de envío no puede ser negativo"),
      demora_dias: z.number().int().optional().default(3),
    }),
    productosIds: z
      .array(z.string().min(1))
      .min(1, "No hay productos seleccionados para comprar"),
    esCompraDirecta: z.boolean().default(false),
  }),
  handler: async (
    { direccionId, datosEnvio, productosIds, esCompraDirecta },
    { userId },
  ) => {
    await asegurarUsuario(userId);

    // Validar que la dirección exista y pertenezca al usuario autenticado (control IDOR)
    const direccion = await prisma.direccion.findFirst({
      where: { id: direccionId, usuarioId: userId },
    });
    if (!direccion) {
      throw new NotFoundError("Dirección", direccionId);
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
        throw new ConflictError(
          "Los productos seleccionados ya no se encuentran en el carrito",
        );
      }

      itemsAProcesar = itemsCarrito.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));
    }

    // Revalidar productos y capturar snapshots atómicos con Seller API o mock
    const idsProductos = itemsAProcesar.map((item) => item.productoId);
    const mapaSnapshots = await obtenerSnapshotsProductos(idsProductos);

    for (const item of itemsAProcesar) {
      const snapshot = mapaSnapshots.get(item.productoId);
      if (
        !snapshot ||
        typeof snapshot.precioCentavos !== "number" ||
        snapshot.precioCentavos <= 0
      ) {
        throw new ConflictError(
          `El producto con ID "${item.productoId}" no tiene un precio válido disponible. Operación cancelada para proteger la integridad de la orden.`,
        );
      }
    }

    const totalProductos = itemsAProcesar.reduce((acc, item) => {
      const snapshot = mapaSnapshots.get(item.productoId)!;
      return acc + snapshot.precioCentavos * item.cantidad;
    }, 0);

    const costoEnvioCentavos = Math.round(datosEnvio.precio * 100);
    const total = totalProductos + costoEnvioCentavos;

    // Derivar vendedorId directamente del snapshot validado
    const primerItemSnapshot = mapaSnapshots.get(itemsAProcesar[0].productoId);
    const vendedorId =
      primerItemSnapshot?.vendedorClerkId || "user_3EXlfKfNj061hH7lOCEhs7Wg7qy";

    // Transacción atómica: Creación de orden con snapshots y vaciado del carrito
    const nuevaOrden = await prisma.$transaction(async (tx) => {
      if (!esCompraDirecta) {
        const itemsEnCarrito = await tx.carrito.findMany({
          where: {
            usuarioId: userId,
            productoId: { in: productosIds },
          },
        });

        if (itemsEnCarrito.length === 0) {
          throw new ConflictError(
            "Los productos seleccionados ya no se encuentran en el carrito",
          );
        }
      }

      const orden = await tx.ordenCompra.create({
        data: {
          usuarioId: userId,
          estado: EstadosOrden.enum.PENDIENTE,
          costoEnvio: costoEnvioCentavos,
          vendedorId: vendedorId,
          operadorEnvio: datosEnvio.operador,
          servicioEnvio: datosEnvio.tipo_servicio,
          demoraDias: datosEnvio.demora_dias ?? 3,
          direccionId: direccionId,
          total: total,
          items: {
            create: itemsAProcesar.map((item) => {
              const snapshot = mapaSnapshots.get(item.productoId)!;
              return {
                productoId: item.productoId,
                nombre: snapshot.nombre,
                marca: snapshot.marca,
                imagenUrl: snapshot.imagenUrl,
                vendedor: snapshot.vendedor,
                precio: snapshot.precioCentavos,
                cantidad: item.cantidad,
              };
            }),
          },
        },
      });

      if (!esCompraDirecta) {
        await tx.carrito.deleteMany({
          where: {
            usuarioId: userId,
            productoId: { in: productosIds },
          },
        });
      }

      return orden;
    });

    // Control de flujo oficial: rethrowIfNavigationError preservará este redirect intacto
    redirect(`/checkout/confirmacion?ordenId=${nuevaOrden.id}`);
  },
});

export async function obtenerOrdenDeUsuario(
  idOrden: string,
  estado: EstadoOrden | EstadoOrden[],
) {
  const userId = await requireUser();

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

  if (!orden) {
    throw new NotFoundError("Orden", idOrden);
  }

  return orden;
}

export async function actualizarOrden(
  idOrden: string,
  estado: EstadoOrden,
  idPago?: string,
  idEnvio?: string,
) {
  const { userId } = await auth();
  if (userId) {
    await requireAdmin();
  }

  const dataToUpdate: Prisma.OrdenCompraUpdateInput = {
    estado,
  };
  if (idPago !== undefined) dataToUpdate.pagoId = idPago;
  if (idEnvio !== undefined) dataToUpdate.envioId = idEnvio;

  const orden = await prisma.ordenCompra.update({
    where: { id: idOrden },
    data: dataToUpdate,
  });

  return { success: true, ordenId: orden.id };
}

export async function obtenerOrden(idOrden: string) {
  const { userId } = await auth();

  const orden = await prisma.ordenCompra.findUnique({
    where: { id: idOrden },
    include: {
      items: true,
    },
  });

  if (!orden) {
    throw new NotFoundError("Orden", idOrden);
  }

  // Si la llamada proviene de un usuario en sesión, validar pertenencia o rol admin
  if (userId && orden.usuarioId !== userId) {
    await requireAdmin();
  }

  const direccion = await prisma.direccion.findUnique({
    where: { id: orden.direccionId },
  });

  return { ...orden, direccion };
}

export async function verDetallesOrden(idOrden: string, usuarioId?: string) {
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

  if (!orden) {
    throw new NotFoundError("Orden", idOrden);
  }

  return orden;
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
        pagoId?: string | null;
      };
    }
  | {
      success: false;
      status: 401 | 403 | 404 | 400 | 409;
      error: string;
      orden?: {
        id: string;
        usuarioId: string;
        vendedorId: string;
        total: number;
        estado: EstadoOrden;
        pagoId?: string | null;
      };
    };

export async function verificarOrdenParaPago(
  idOrden: string,
  usuarioId: string,
): Promise<ResultadoVerificacionOrdenPago> {
  if (!usuarioId) {
    return { success: false, status: 401, error: "No autorizado" };
  }

  const orden = await prisma.ordenCompra.findUnique({
    where: { id: idOrden },
    select: {
      id: true,
      usuarioId: true,
      vendedorId: true,
      total: true,
      estado: true,
      pagoId: true,
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

  if (orden.estado === EstadoOrden.PAGADO) {
    return {
      success: false,
      status: 409,
      error: "La orden ya ha sido pagada previamente",
      orden,
    };
  }

  if (
    orden.estado !== EstadoOrden.PENDIENTE &&
    orden.estado !== EstadoOrden.CANCELADO
  ) {
    return {
      success: false,
      status: 400,
      error: "Solo se pueden pagar órdenes en estado pendiente o cancelado",
      orden,
    };
  }

  return { success: true, orden };
}

export async function aprobarOrden(
  idOrden: string,
  idPago: string,
): Promise<{
  success: boolean;
  yaProcesada?: boolean;
  envioId?: string | null;
  error?: string;
}> {
  const idPagoStr = String(idPago);

  // 1. Control de unicidad de pagoId: verificar si ya fue registrado en otra orden
  const ordenConEstePago = await prisma.ordenCompra.findUnique({
    where: { pagoId: idPagoStr },
    select: { id: true, estado: true, envioId: true },
  });

  if (ordenConEstePago && ordenConEstePago.id !== idOrden) {
    console.error(
      `[aprobarOrden] Conflicto de pago: idPago ${idPagoStr} ya está asociado a la orden ${ordenConEstePago.id}`,
    );
    return {
      success: false,
      error: `El pago ${idPagoStr} ya fue procesado para otra orden`,
    };
  }

  // 2. Verificar estado actual de la orden a procesar
  const ordenActual = await prisma.ordenCompra.findUnique({
    where: { id: idOrden },
    select: { id: true, estado: true, pagoId: true, envioId: true },
  });

  if (!ordenActual) {
    throw new NotFoundError("Orden", idOrden);
  }

  // Si la orden ya está pagada:
  if (ordenActual.estado === EstadoOrden.PAGADO) {
    if (ordenActual.envioId) {
      console.log(
        `[aprobarOrden] Orden ${idOrden} ya está PAGADA y con envío (${ordenActual.envioId}). Operación idempotente.`,
      );
      return { success: true, yaProcesada: true, envioId: ordenActual.envioId };
    }

    console.log(
      `[aprobarOrden] Orden ${idOrden} está PAGADA pero pendiente de envío. Generando envío...`,
    );
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
      data: { envioId: id_envio },
    });

    return { success: true, yaProcesada: false, envioId: id_envio };
  }

  // 3. Transición atómica condicional: Solo pasa a PAGADO si sigue en PENDIENTE o CANCELADO
  const resultado = await prisma.ordenCompra.updateMany({
    where: {
      id: idOrden,
      estado: { in: [EstadoOrden.PENDIENTE, EstadoOrden.CANCELADO] },
    },
    data: {
      estado: EstadoOrden.PAGADO,
      pagoId: idPagoStr,
    },
  });

  if (resultado.count === 0) {
    const ordenRevisada = await prisma.ordenCompra.findUnique({
      where: { id: idOrden },
      select: { envioId: true, estado: true },
    });
    return {
      success: true,
      yaProcesada: true,
      envioId: ordenRevisada?.envioId ?? undefined,
    };
  }

  // 4. Generar orden de envío en Shipping App
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

  return { success: true, yaProcesada: false, envioId: id_envio };
}

export async function rechazarOrden(
  idOrden: string,
  idPago: string,
): Promise<{ success: boolean; yaProcesada?: boolean; error?: string }> {
  const idPagoStr = String(idPago);

  // 1. Control de unicidad de pagoId
  const ordenConEstePago = await prisma.ordenCompra.findUnique({
    where: { pagoId: idPagoStr },
    select: { id: true, estado: true },
  });

  if (ordenConEstePago && ordenConEstePago.id !== idOrden) {
    console.error(
      `[rechazarOrden] Conflicto de pago: idPago ${idPagoStr} ya está asociado a la orden ${ordenConEstePago.id}`,
    );
    return {
      success: false,
      error: `El pago ${idPagoStr} ya fue procesado para otra orden`,
    };
  }

  // 2. Verificar estado actual
  const ordenActual = await prisma.ordenCompra.findUnique({
    where: { id: idOrden },
    select: { id: true, estado: true, pagoId: true },
  });

  if (!ordenActual) {
    throw new NotFoundError("Orden", idOrden);
  }

  if (ordenActual.estado === EstadoOrden.CANCELADO) {
    if (ordenActual.pagoId !== idPagoStr) {
      await prisma.ordenCompra.update({
        where: { id: idOrden },
        data: { pagoId: idPagoStr },
      });
    }
    return { success: true, yaProcesada: true };
  }

  if (ordenActual.estado === EstadoOrden.PAGADO) {
    console.warn(
      `[rechazarOrden] Se intentó rechazar la orden ${idOrden} que ya está PAGADA. Ignorando evento tardío.`,
    );
    return {
      success: false,
      error: "La orden ya ha sido pagada previamente y no puede ser cancelada",
    };
  }

  // 3. Transición atómica condicional
  const resultado = await prisma.ordenCompra.updateMany({
    where: {
      id: idOrden,
      estado: { in: [EstadoOrden.PENDIENTE, EstadoOrden.CANCELADO] },
    },
    data: {
      estado: EstadoOrden.CANCELADO,
      pagoId: idPagoStr,
    },
  });

  if (resultado.count === 0) {
    return { success: true, yaProcesada: true };
  }

  return { success: true, yaProcesada: false };
}

export async function vaciarCarrito(usuarioId: string) {
  const currentUserId = await requireUser();
  if (usuarioId !== currentUserId) {
    await requireAdmin();
  }

  await prisma.carrito.deleteMany({
    where: { usuarioId },
  });
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
      throw new NotFoundError("Envío con trackingId", trackingId);
    }
    throw error;
  }
}

export async function obtenerItemsOrdenParaSeller(ordenId: string) {
  const { userId } = await auth();
  if (userId) {
    const ordenUsuario = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      select: { usuarioId: true },
    });
    if (!ordenUsuario) throw new NotFoundError("Orden", ordenId);
    if (ordenUsuario.usuarioId !== userId) {
      await requireAdmin();
    }
  }

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

  if (!orden) throw new NotFoundError("Orden", ordenId);

  return orden;
}

export async function obtenerEstadoOrden(paymentId: string) {
  return await prisma.ordenCompra.findFirst({
    where: {
      id: paymentId,
    },
    select: {
      estado: true,
    },
  });
}
