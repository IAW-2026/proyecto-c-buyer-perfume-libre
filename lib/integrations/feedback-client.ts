/**
 * Cliente de integración con Feedback App.
 * Utiliza el cliente HTTP centralizado para consulta y envío de reseñas.
 */

import { httpClient } from "@/lib/http-client";

function getFeedbackBaseUrl(): string {
  const url =
    process.env.FEEDBACK_API_URL ||
    "https://proyecto-c-feedback2-perfume-libre.vercel.app/api";
  return url.replace(/\/+$/, "");
}

function getFeedbackApiKey(): string | undefined {
  return process.env.FEEDBACK_API_KEY;
}

export interface RespuestaResumenProducto {
  promedio_producto?: number | string;
  total_resenas?: number;
  resenas?: Array<{
    id: string;
    puntuacion: number;
    comentario: string;
    fecha?: string;
  }>;
}

export interface RespuestaResumenVendedor {
  promedio_vendedor?: number | string;
  total_resenas?: number;
}

export interface DatosResenaProductoPayload {
  id_producto: string;
  id_orden: string;
  id_usuario?: string;
  puntuacion: number;
  comentario: string;
  imagenes?: string[];
}

export interface DatosResenaVendedorPayload {
  id_vendedor: string;
  id_orden: string;
  id_usuario?: string;
  puntuacion: number;
  comentario: string;
}

export const feedbackClient = {
  /**
   * Obtiene el resumen de reseñas y calificación de un producto.
   * Operación GET idempotente con reintentos transitorios.
   */
  async obtenerResumenProducto(
    productoId: string,
  ): Promise<RespuestaResumenProducto | null> {
    const baseUrl = getFeedbackBaseUrl();

    try {
      return await httpClient<RespuestaResumenProducto>({
        url: `${baseUrl}/resenas/producto/${encodeURIComponent(productoId)}/resumen`,
        method: "GET",
        service: "FeedbackApp",
        operation: "obtenerResumenProducto",
        timeoutMs: 6000,
        retry: {
          maxRetries: 2,
        },
      });
    } catch (error) {
      // Si el producto no tiene reseñas (404), retornar null legítimo
      const isNotFound =
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: number }).status === 404;

      if (isNotFound) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtiene el resumen de calificación de un vendedor.
   * Operación GET idempotente con reintentos transitorios.
   */
  async obtenerResumenVendedor(
    vendedorId: string,
  ): Promise<RespuestaResumenVendedor | null> {
    const baseUrl = getFeedbackBaseUrl();

    try {
      return await httpClient<RespuestaResumenVendedor>({
        url: `${baseUrl}/resenas/vendedor/${encodeURIComponent(vendedorId)}/resumen`,
        method: "GET",
        service: "FeedbackApp",
        operation: "obtenerResumenVendedor",
        timeoutMs: 6000,
        retry: {
          maxRetries: 2,
        },
      });
    } catch (error) {
      const isNotFound =
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: number }).status === 404;

      if (isNotFound) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Envía una reseña sobre un producto comprado.
   * Operación POST de mutación: NO se reintenta automáticamente.
   */
  async crearResenaProducto(
    payload: DatosResenaProductoPayload,
    token: string,
  ): Promise<unknown> {
    const baseUrl = getFeedbackBaseUrl();
    const apiKey = getFeedbackApiKey();

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    if (apiKey) {
      headers.set("api_key", apiKey);
    }

    return httpClient({
      url: `${baseUrl}/resenas/producto`,
      method: "POST",
      headers,
      body: payload,
      service: "FeedbackApp",
      operation: "crearResenaProducto",
      timeoutMs: 8000,
      retry: {
        maxRetries: 0,
      },
    });
  },

  /**
   * Envía una reseña sobre un vendedor.
   * Operación POST de mutación: NO se reintenta automáticamente.
   */
  async crearResenaVendedor(
    payload: DatosResenaVendedorPayload,
    token: string,
  ): Promise<unknown> {
    const baseUrl = getFeedbackBaseUrl();
    const apiKey = getFeedbackApiKey();

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    if (apiKey) {
      headers.set("api_key", apiKey);
    }

    return httpClient({
      url: `${baseUrl}/resenas/vendedor`,
      method: "POST",
      headers,
      body: payload,
      service: "FeedbackApp",
      operation: "crearResenaVendedor",
      timeoutMs: 8000,
      retry: {
        maxRetries: 0,
      },
    });
  },
};
