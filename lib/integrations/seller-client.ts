/**
 * Cliente de integración con Seller App.
 * Utiliza el cliente HTTP centralizado con timeouts, reintentos y correlación.
 */

import { httpClient } from "@/lib/http-client";

function getSellerConfig() {
  const baseUrl = process.env.SELLER_API_URL;
  const apiKey = process.env.SELLER_API_KEY;

  if (!baseUrl) {
    throw new Error("La variable de entorno SELLER_API_URL no está configurada");
  }
  if (!apiKey) {
    throw new Error("La variable de entorno SELLER_API_KEY no está configurada");
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

export interface ProductoSellerItem {
  producto_id: string | number;
  titulo: string;
  descripcion?: string;
  precio: number | string;
  imagen?: string;
  stock?: number;
  vendedor_id?: string | number;
  categoria?: string;
}

export interface RespuestaProductosSeller {
  items: ProductoSellerItem[];
  total?: number;
  pagina?: number;
}

export interface RespuestaDetalleProductoSeller {
  producto: {
    producto_id?: string | number;
    id?: string | number;
    titulo: string;
    descripcion?: string;
    precio: number | string;
    imagen?: string;
    imagenes?: string[];
    vendedor_id?: string | number;
    categoria?: string;
    stock?: number;
  };
  vendedor?: {
    nombre?: string;
    clerk_id?: string;
  };
}

export const sellerClient = {
  /**
   * Obtiene la lista de productos del catálogo de Seller App con filtros y paginación.
   */
  async obtenerProductos(filtros?: {
    titulo?: string;
    categorias?: string[];
    page?: number;
    limit?: number;
  }): Promise<RespuestaProductosSeller> {
    const { baseUrl, apiKey } = getSellerConfig();

    const headers = new Headers();
    headers.set("api_key", apiKey);

    if (filtros?.titulo) {
      headers.set("titulo", filtros.titulo);
    }
    if (filtros?.categorias && filtros.categorias.length > 0) {
      headers.set("categorias", JSON.stringify(filtros.categorias));
    }
    if (filtros?.page) {
      headers.set("pagina", String(filtros.page));
    }
    if (filtros?.limit) {
      headers.set("cantidad_pagina", String(filtros.limit));
    }

    return httpClient<RespuestaProductosSeller>({
      url: `${baseUrl}/seller/productos`,
      method: "GET",
      headers,
      service: "SellerApp",
      operation: "obtenerProductos",
      timeoutMs: 8000,
      retry: {
        maxRetries: 2,
      },
    });
  },

  /**
   * Obtiene un producto individual por ID desde Seller App.
   */
  async obtenerProductoPorId(id: string): Promise<RespuestaDetalleProductoSeller> {
    const { baseUrl, apiKey } = getSellerConfig();

    const headers = new Headers();
    headers.set("api_key", apiKey);

    return httpClient<RespuestaDetalleProductoSeller>({
      url: `${baseUrl}/seller/productos/${encodeURIComponent(id)}`,
      method: "GET",
      headers,
      service: "SellerApp",
      operation: "obtenerProductoPorId",
      timeoutMs: 8000,
      retry: {
        maxRetries: 2,
      },
    });
  },

  /**
   * Obtiene el token de acceso de Mercado Pago del vendedor.
   */
  async obtenerAccessTokenVendedor(idVendedor: string): Promise<string> {
    const { baseUrl, apiKey } = getSellerConfig();

    const headers = new Headers();
    headers.set("api_key", apiKey);

    const respuesta = await httpClient<{ access_token: string }>({
      url: `${baseUrl}/seller/vendedores/${encodeURIComponent(idVendedor)}/access_token`,
      method: "GET",
      headers,
      service: "SellerApp",
      operation: "obtenerAccessTokenVendedor",
      timeoutMs: 8000,
      retry: {
        maxRetries: 2,
      },
    });

    return respuesta.access_token;
  },
};
