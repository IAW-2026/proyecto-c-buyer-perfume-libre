"use server";

import {
  fetchProductoDesdeSeller,
  generarOrdenEnvio,
  obtenerPreciosDeProductos,
} from "@/lib/api";
import { EstadoOrden, Prisma } from "@/lib/generated/prisma/client";
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
  const userId = await requireUser();

  await asegurarUsuario(userId);

  if (
    !direccionId ||
    typeof direccionId !== "string" ||
    direccionId.trim() === ""
  ) {
    throw new Error("ID de dirección inválido");
  }

  // Validar que la dirección exista y pertenezca al usuario autenticado
  const direccion = await prisma.direccion.findFirst({
    where: { id: direccionId, usuarioId: userId },
  });
  if (!direccion) {
    throw new Error(
      "Dirección no encontrada o no pertenece al usuario autenticado",
    );
  }

  if (
    !productosIds ||
    !Array.isArray(productosIds) ||
    productosIds.length === 0
  ) {
    throw new Error("No hay productos seleccionados para comprar");
  }

  if (
    !datosEnvio ||
    typeof datosEnvio.precio !== "number" ||
    datosEnvio.precio < 0 ||
    !datosEnvio.operador ||
    !datosEnvio.tipo_servicio
  ) {
    throw new Error("Datos de envío inválidos");
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

  // Revalidar precios con Seller API en el momento de confirmar
  const idsProductos = itemsAProcesar.map((item) => item.productoId);
  const preciosProductos = await obtenerPreciosDeProductos(idsProductos);

  const mapaPrecios = new Map<string, number>();
  for (const p of preciosProductos) {
    if (typeof p.precio === "number" && p.precio > 0) {
      mapaPrecios.set(p.id, p.precio);
    }
  }

  for (const item of itemsAProcesar) {
    const precio = mapaPrecios.get(item.productoId);
    if (precio === undefined || precio <= 0) {
      throw new Error(
        `El producto con ID "${item.productoId}" no tiene un precio válido disponible. Operación cancelada para proteger la integridad de la orden.`,
      );
    }
  }

  const totalProductos = itemsAProcesar.reduce((acc, item) => {
    const precioUnitario = mapaPrecios.get(item.productoId)!;
    return acc + precioUnitario * item.cantidad;
  }, 0);

  const costoEnvioCentavos = Math.round(datosEnvio.precio * 100);
  const total = totalProductos + costoEnvioCentavos;

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

  // Transacción atómica: Creación de la orden y vaciado seguro de los ítems del carrito
  const nuevaOrden = await prisma.$transaction(async (tx) => {
    if (!esCompraDirecta) {
      const itemsEnCarrito = await tx.carrito.findMany({
        where: {
          usuarioId: userId,
          productoId: { in: productosIds },
        },
      });

      if (itemsEnCarrito.length === 0) {
        throw new Error(
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
        demoraDias: datosEnvio.demora_dias,
        direccionId: direccionId,
        total: total,
        items: {
          create: itemsAProcesar.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: mapaPrecios.get(item.productoId)!,
          })),
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
    const dataToUpdate: Prisma.OrdenCompraUpdateInput = {
      estado,
    };
    if (idPago !== undefined) dataToUpdate.pagoId = idPago;
    if (idEnvio !== undefined) dataToUpdate.envioId = idEnvio;

    await prisma.ordenCompra.update({
      where: { id: idOrden },
      data: dataToUpdate,
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

  try {
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
  } catch (error) {
    throw new Error(`Error al verificar orden para pago: ${error}`);
  }
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
    throw new Error(`Orden ${idOrden} no encontrada`);
  }

  // Si la orden ya está pagada:
  if (ordenActual.estado === EstadoOrden.PAGADO) {
    // Si ya tiene el envío generado, la operación es 100% idempotente: no duplicar envío
    if (ordenActual.envioId) {
      console.log(
        `[aprobarOrden] Orden ${idOrden} ya está PAGADA y con envío (${ordenActual.envioId}). Operación idempotente.`,
      );
      return { success: true, yaProcesada: true, envioId: ordenActual.envioId };
    }

    // Si está PAGADA pero no tiene envioId (ej. fallo previo en shipping app), generar el envío pendiente
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
    // Otra ejecución concurrente (ej. webhook de MP) actualizó la orden casi simultáneamente
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

  // 4. Generar orden de envío en Shipping App (fuera de la transacción de DB para no retener conexiones)
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

  // 1. Control de unicidad de pagoId: verificar si ya fue asignado a otra orden
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
    throw new Error(`Orden ${idOrden} no encontrada`);
  }

  // Si ya está CANCELADA con este pago, es una operación idempotente
  if (ordenActual.estado === EstadoOrden.CANCELADO) {
    if (ordenActual.pagoId !== idPagoStr) {
      await prisma.ordenCompra.update({
        where: { id: idOrden },
        data: { pagoId: idPagoStr },
      });
    }
    return { success: true, yaProcesada: true };
  }

  // Si ya está PAGADA, no permitir que un evento de rechazo tardío cancele una orden ya pagada
  if (ordenActual.estado === EstadoOrden.PAGADO) {
    console.warn(
      `[rechazarOrden] Se intentó rechazar la orden ${idOrden} que ya está PAGADA. Ignorando evento tardío.`,
    );
    return {
      success: false,
      error: "La orden ya ha sido pagada previamente y no puede ser cancelada",
    };
  }

  // 3. Transición atómica condicional: Solo pasa a CANCELADO si sigue en PENDIENTE o CANCELADO
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
