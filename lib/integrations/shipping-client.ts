/**
 * Cliente de integración con Shipping App.
 * Utiliza el cliente HTTP centralizado para cotizaciones, seguimiento y generación de órdenes de envío.
 */

import { httpClient } from "@/lib/http-client";
import { OpcionEnvio } from "@/lib/mockEnvios";

function getShippingBaseUrl(): string {
  const url =
    process.env.SHIPPING_API_URL ||
    "https://proyecto-c-shipping2-perfume-libre.vercel.app/api";
  return url.replace(/\/+$/, "");
}

export interface ItemEnvioPayload {
  productoId: string;
  cantidad: number;
  precio: number;
}

export interface ServicioEnvioPayload {
  operador: string;
  precio: number;
  tipo_servicio: string;
  demora_dias: number;
}

export interface DatosCrearEnvioPayload {
  id_orden: string;
  id_pedido?: string;
  id_comprador?: string;
  id_vendedor: string;
  direccion_entrega: string;
  items: ItemEnvioPayload[] | Record<string, unknown>[];
  servicio_elegido: ServicioEnvioPayload | Record<string, unknown>;
  usuarioId: string;
}

export interface RespuestaCotizacionesShipping {
  opciones: OpcionEnvio[];
}

export interface RespuestaCrearEnvioShipping {
  trackingId?: string;
  id?: string;
  mensaje?: string;
}

export interface RespuestaHistorialShipping {
  estado_actual?: string;
  estado?: string;
  ubicacion_actual?: string;
  ubicacion?: string;
  updatedAt?: string;
  fecha?: string;
  historial?: Array<{
    fecha?: string;
    timestamp?: string;
    ubicacion?: string;
    descripcion?: string;
  }>;
}

export const shippingClient = {
  /**
   * Obtiene cotizaciones de envío según código postal y dirección.
   * Operación de sólo cálculo / lectura: reintento permitido ante errores transitorios.
   */
  async obtenerCotizaciones(
    codigoPostal: string,
    direccionEntrega: string,
  ): Promise<OpcionEnvio[]> {
    const baseUrl = getShippingBaseUrl();

    const data = await httpClient<RespuestaCotizacionesShipping>({
      url: `${baseUrl}/shipping/cotizar`,
      method: "POST",
      body: {
        codigo_postal: codigoPostal,
        direccion_entrega: direccionEntrega,
      },
      service: "ShippingApp",
      operation: "obtenerCotizaciones",
      timeoutMs: 8000,
      retry: {
        idempotent: true,
        maxRetries: 2,
      },
    });

    if (!data || !Array.isArray(data.opciones)) {
      throw new Error("La respuesta de cotizaciones de Shipping no tiene el formato esperado");
    }

    return data.opciones;
  },

  /**
   * Consulta el historial y estado actual de un envío por su tracking ID.
   * Operación GET idempotente.
   */
  async obtenerHistorial(
    trackingId: string,
    token?: string | null,
  ): Promise<RespuestaHistorialShipping> {
    const baseUrl = getShippingBaseUrl();
    const headers = new Headers();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return httpClient<RespuestaHistorialShipping>({
      url: `${baseUrl}/shipping/${encodeURIComponent(trackingId)}`,
      method: "GET",
      headers,
      service: "ShippingApp",
      operation: "obtenerHistorial",
      timeoutMs: 8000,
      retry: {
        maxRetries: 2,
      },
    });
  },

  /**
   * Crea una orden física de despacho de envío en Shipping App.
   * Operación de mutación (POST con efectos secundarios): NO se reintenta automáticamente.
   */
  async crearOrdenEnvio(
    payload: DatosCrearEnvioPayload,
  ): Promise<RespuestaCrearEnvioShipping> {
    const baseUrl = getShippingBaseUrl();

    return httpClient<RespuestaCrearEnvioShipping>({
      url: `${baseUrl}/shipping/ordenes`,
      method: "POST",
      body: payload,
      service: "ShippingApp",
      operation: "crearOrdenEnvio",
      timeoutMs: 10000,
      retry: {
        maxRetries: 0, // Mutación no idempotente: sin reintento ciego automático
      },
    });
  },
};
