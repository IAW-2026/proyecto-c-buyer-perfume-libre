"use server";

import { auth } from "@clerk/nextjs/server";
import { EstadoOrdenType, EstadosOrden } from "@/schema/perfume.schema";
import { obtenerHistorialSimulado } from "@/lib/mockEnvios";
import { shippingClient } from "@/lib/integrations/shipping-client";

export interface ItemHistorialEnvio {
  fecha: string;
  ubicacion: string;
}

export interface RespuestaHistorialEnvio {
  estadoActual: EstadoOrdenType;
  historial: ItemHistorialEnvio[];
}

function normalizarEstadoEnvio(estado: unknown): EstadoOrdenType {
  if (typeof estado !== "string") return EstadosOrden.enum.PENDIENTE;
  const upper = estado.toUpperCase().trim().replace(/[\s-]+/g, "_");

  if (upper in EstadosOrden.enum) {
    return upper as EstadoOrdenType;
  }
  if (upper.includes("TRANSIT") || upper.includes("VIAJE")) return EstadosOrden.enum.EN_TRANSITO;
  if (upper.includes("ENTREG") || upper.includes("DELIVER")) return EstadosOrden.enum.ENTREGADO;
  if (upper.includes("PREPAR") || upper.includes("EMPAQ")) return EstadosOrden.enum.PREPARANDO;
  if (upper.includes("CANCEL")) return EstadosOrden.enum.CANCELADO;
  if (upper.includes("PAG")) return EstadosOrden.enum.PAGADO;

  return EstadosOrden.enum.PENDIENTE;
}

function formatearFechaEvento(fecha: unknown): string {
  if (!fecha) {
    return new Date().toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  const d = new Date(String(fecha));
  if (isNaN(d.getTime())) {
    return String(fecha);
  }

  return d.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export async function obtenerHistorialEnvioReal(
  trackingId: string,
  estadoFallback?: string,
): Promise<RespuestaHistorialEnvio> {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const data = await shippingClient.obtenerHistorial(trackingId, token);

    const estadoActual = normalizarEstadoEnvio(
      data.estado_actual || data.estado || estadoFallback,
    );

    const historial: ItemHistorialEnvio[] =
      Array.isArray(data.historial) && data.historial.length > 0
        ? data.historial.map(
            (evento: {
              fecha?: string;
              timestamp?: string;
              ubicacion?: string;
              descripcion?: string;
            }) => ({
              fecha: formatearFechaEvento(evento.fecha || evento.timestamp),
              ubicacion:
                evento.ubicacion ||
                evento.descripcion ||
                "Actualización de envío",
            }),
          )
        : [
            {
              fecha: formatearFechaEvento(data.updatedAt || data.fecha),
              ubicacion:
                data.ubicacion_actual ||
                data.ubicacion ||
                "El paquete se encuentra en el centro logístico de distribución",
            },
          ];

    return {
      estadoActual,
      historial,
    };
  } catch (error) {
    console.error(
      `⚠️ Error al consultar Shipping App para ${trackingId}, usando fallback simulado:`,
      error,
    );
    const mock = await obtenerHistorialSimulado(estadoFallback || "PENDIENTE");
    return {
      estadoActual: mock.estadoActual as EstadoOrdenType,
      historial: mock.historial,
    };
  }
}
