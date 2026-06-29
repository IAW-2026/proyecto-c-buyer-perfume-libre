import {
  Perfume,
  PerfumeCard,
  PerfumeCardsSchema,
  PerfumeSchema,
  PerfumeFavoritosSchema,
  PerfumeFavorito,
  PerfumeCarrito,
  PerfumeCarritosSchema,
  PerfumeComprado,
  PerfumeCompradosSchema,
  PerfumesSchema,
} from "@/schema/perfume.schema";
import { mockPerfumes } from "./mockPerfumes";
import { z } from "zod";
import { obtenerCotizacionesEnvioMock } from "./mockEnvios";
import {
  enviarResenaProductoReal,
  enviarResenaVendedorReal,
} from "@/actions/resenas";
import { auth } from "@clerk/nextjs/server";
import { obtenerHistorialEnvioReal } from "@/actions/tracking";

export interface FiltrosCatalogo {
  q?: string | string[];
  marca?: string | string[];
  genero?: string | string[];
  tamano?: string | string[];
  precioMin?: string | string[];
  precioMax?: string | string[];
  page: number;
  limit: number;
}

export async function obtenerCatalogo(
  filtros: FiltrosCatalogo,
): Promise<{ items: PerfumeCard[]; total: number }> {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerCatalogoReal(filtros);
  } else {
    return obtenerCatalogoMock(filtros);
  }
}

async function obtenerCatalogoReal(
  filtros: FiltrosCatalogo,
): Promise<{ items: PerfumeCard[]; total: number }> {
  try {
    const { q, marca, genero, tamano, precioMin, precioMax, page, limit } =
      filtros;

    const categorias: string[] = [];
    if (marca) {
      const marcasArr = Array.isArray(marca) ? marca : [marca];
      categorias.push(...marcasArr.map((m) => m.toLowerCase()));
    }
    if (genero) {
      const generosArr = Array.isArray(genero) ? genero : [genero];
      categorias.push(...generosArr.map((g) => g.toLowerCase()));
    }

    const headers = new Headers();
    headers.append("titulo", q ? q.toString() : " ");
    headers.append("categorias", JSON.stringify(categorias));
    headers.append("pagina", String(page || 1));
    headers.append("cantidad_pagina", String(limit || 12));

    headers.append("api_key", process.env.SELLER_API_KEY || "");

    const baseUrl =
      process.env.SELLER_API_URL ||
      "https://proyecto-c-seller-perfume-libre.vercel.app/api";
    const response = await fetch(`${baseUrl}/seller/productos`, {
      method: "GET",
      headers: headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error de la API Seller: ${response.statusText}`);
    }

    const data = await response.json();

    let itemsMapeados: PerfumeCard[] = (data.items || []).map((prod: any) => ({
      id: String(prod.producto_id),
      nombre: prod.titulo,
      precio: Math.round(Number(prod.precio)) * 100,
      imagenUrl: prod.imagen || "/placeholder-perfume.jpg",
      marca: prod.titulo.split(" ")[0] || "Marca Desconocida",
      tamaño: 100,
      calificacion: 0,
    }));

    try {
      const feedbackBaseUrl =
        process.env.FEEDBACK_API_URL ||
        "https://proyecto-c-feedback2-perfume-libre.vercel.app/api/";

      const promesasCalificaciones = itemsMapeados.map((item) =>
        fetch(`${feedbackBaseUrl}/resenas/producto/${item.id}/resumen`, {
          cache: "no-store",
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      );

      const resultadosCalificaciones = await Promise.all(
        promesasCalificaciones,
      );

      itemsMapeados = itemsMapeados.map((item, index) => {
        const ratingData = resultadosCalificaciones[index];
        if (ratingData && ratingData.promedio_producto) {
          item.calificacion = Number(ratingData.promedio_producto);
        }
        return item;
      });
    } catch (errFeedback) {
      console.warn(
        "Aviso: No se pudieron cargar las calificaciones masivas",
        errFeedback,
      );
    }

    if (precioMin) {
      itemsMapeados = itemsMapeados.filter(
        (p) => p.precio >= Number(precioMin),
      );
    }
    if (precioMax) {
      itemsMapeados = itemsMapeados.filter(
        (p) => p.precio <= Number(precioMax),
      );
    }

    return {
      items: itemsMapeados,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Error al obtener catálogo real:", error);
    return { items: [], total: 0 };
  }
}

async function obtenerCatalogoMock(
  filtros: FiltrosCatalogo,
): Promise<{ items: PerfumeCard[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { q, marca, genero, tamano, precioMin, precioMax, page, limit } =
    filtros;

  let resultado = [...mockPerfumes];

  if (q && typeof q === "string") {
    const query = q.toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.marca.toLowerCase().includes(query),
    );
  }

  if (marca) {
    const marcasSeleccionadas = Array.isArray(marca) ? marca : [marca];
    resultado = resultado.filter((p) => marcasSeleccionadas.includes(p.marca));
  }

  if (genero) {
    const generosSeleccionados = Array.isArray(genero) ? genero : [genero];
    resultado = resultado.filter((p) =>
      generosSeleccionados.includes(p.genero),
    );
  }

  if (tamano) {
    const tamanosSeleccionados = (
      Array.isArray(tamano) ? tamano : [tamano]
    ).map(Number);
    resultado = resultado.filter((p) =>
      tamanosSeleccionados.includes(p.tamaño),
    );
  }

  if (precioMin && typeof precioMin === "string") {
    resultado = resultado.filter((p) => p.precio >= Number(precioMin));
  }
  if (precioMax && typeof precioMax === "string") {
    resultado = resultado.filter((p) => p.precio <= Number(precioMax));
  }

  const total = resultado.length;
  const inicio = (page - 1) * limit;
  const fin = inicio + limit;

  const items = validarTipo(resultado, PerfumeCardsSchema);
  const itemsPagina = items.slice(inicio, fin);

  return { items: itemsPagina, total };
}

export async function obtenerDetallePerfume(id: string): Promise<Perfume> {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerDetallePerfumeReal(id);
  } else {
    return obtenerDetallePerfumeMock(id);
  }
}

async function obtenerDetallePerfumeMock(id: string): Promise<Perfume> {
  {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const perfume = mockPerfumes.find((p) => p.id === id);
    if (!perfume) {
      throw new Error("Perfume no encontrado");
    }

    return validarTipo(perfume, PerfumeSchema);
  }
}

async function obtenerDetallePerfumeReal(id: string): Promise<Perfume> {
  try {
    const sellerUrl =
      process.env.SELLER_API_URL ||
      "https://proyecto-c-seller-perfume-libre.vercel.app/api";
    const headersSeller = new Headers();
    headersSeller.append(
      "api_key",
      process.env.SELLER_API_KEY || "perfumelibre2026",
    );

    const resSeller = await fetch(`${sellerUrl}/seller/productos/${id}`, {
      method: "GET",
      headers: headersSeller,
      cache: "no-store",
    });

    if (!resSeller.ok) {
      throw new Error(`Error API Seller: ${resSeller.status}`);
    }

    const dataSeller = await resSeller.json();

    const dataProducto = dataSeller.producto;
    const vendedorId = String(
      dataSeller.producto?.vendedor_id || "Boutique Oficial",
    );

    let calificacionProducto = 0;
    let calificacionVendedor = 0;

    try {
      const feedbackBaseUrl =
        process.env.FEEDBACK_API_URL ||
        "https://proyecto-c-feedback2-perfume-libre.vercel.app/api/";
      const [resProducto, resVendedor] = await Promise.allSettled([
        fetch(`${feedbackBaseUrl}/resenas/producto/${id}/resumen`, {
          cache: "no-store",
        }),
        fetch(`${feedbackBaseUrl}/resenas/vendedor/${vendedorId}/resumen`, {
          cache: "no-store",
        }),
      ]);

      if (resProducto.status === "fulfilled" && resProducto.value.ok) {
        const dataProd = await resProducto.value.json();
        calificacionProducto = Number(dataProd.promedio_producto) || 0;
      }

      if (resVendedor.status === "fulfilled" && resVendedor.value.ok) {
        const dataVend = await resVendedor.value.json();
        calificacionVendedor = Number(dataVend.promedio_vendedor) || 0;
      }
    } catch (errFeedback) {
      console.warn(
        "La API de Feedback falló, usando calificaciones en 0:",
        errFeedback,
      );
    }

    const perfumeMapeado = {
      id: String(dataProducto.producto_id),
      nombre: dataProducto.titulo,
      marca: dataProducto.titulo.split(" ")[0] || "Marca Desconocida",
      tamaño: 100,
      precio: Math.round(Number(dataProducto.precio) * 100) || 0,
      imagenesUrl: [dataProducto.imagen || "/placeholder-perfume.jpg"],
      descripcion: dataProducto.descripcion || "Sin descripción disponible.",
      calificacionProducto: calificacionProducto,
      calificacionVendedor: calificacionVendedor,
      vendedor: dataSeller.vendedor.nombre,
      genero: "Unisex",
    };

    return validarTipo(perfumeMapeado, PerfumeSchema);
  } catch (error) {
    console.error(
      "⚠️ Error fatal al obtener perfume real, usando Mock:",
      error,
    );
    return obtenerDetallePerfumeMock(id);
  }
}

export async function obtenerProductosFavoritos(
  ids: string[],
): Promise<PerfumeFavorito[]> {
  if (!ids || ids.length === 0) return [];
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerProductosFavoritosReal(ids);
  } else {
    return obtenerProductosFavoritosMock(ids);
  }
}

async function obtenerProductosFavoritosMock(
  ids: string[],
): Promise<PerfumeFavorito[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeFavoritosSchema);
}

async function obtenerProductosFavoritosReal(
  ids: string[],
): Promise<PerfumeFavorito[]> {
  try {
    const promesas = ids.map((id) =>
      fetchProductoDesdeSeller(id).catch((err) => {
        console.warn(`No se pudo cargar el favorito ${id}:`, err.message);
        return null;
      }),
    );

    const resultadosRaw = await Promise.all(promesas);

    const productosValidos = resultadosRaw.filter((prod) => prod !== null);

    const itemsMapeados = productosValidos
      .map((prod) => {
        const item = prod.producto;

        if (!item) return null;

        return {
          id: String(item.producto_id),
          nombre: item.titulo,
          marca: item.titulo.split(" ")[0] || "Marca Premium",
          precio: Math.round(Number(item.precio)) * 100 || 0,
          imagenesUrl: [item.imagen || "/placeholder-perfume.jpg"],
        };
      })
      .filter((prod) => prod !== null);

    return validarTipo(itemsMapeados, PerfumeFavoritosSchema);
  } catch (error) {
    console.error(
      "Error general obteniendo favoritos reales, usando Mock:",
      error,
    );
    return obtenerProductosFavoritosMock(ids);
  }
}

export async function obtenerProductosCarrito(
  ids: string[],
): Promise<PerfumeCarrito[]> {
  if (!ids || ids.length === 0) return [];
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerProductosCarritoReal(ids);
  } else {
    return obtenerProductosCarritoMock(ids);
  }
}

async function obtenerProductosCarritoMock(
  ids: string[],
): Promise<PerfumeCarrito[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeCarritosSchema);
}

async function obtenerProductosCarritoReal(
  ids: string[],
): Promise<PerfumeCarrito[]> {
  try {
    const promesas = ids.map((id) =>
      fetchProductoDesdeSeller(id).catch((err) => {
        console.warn(`No se pudo cargar el producto ${id}:`, err.message);
        return null;
      }),
    );

    const resultadosRaw = await Promise.all(promesas);

    const productosValidos = resultadosRaw.filter((prod) => prod !== null);
    const itemsMapeados = productosValidos
      .map((prod) => {
        const item = prod.producto;
        const vendedor = prod.vendedor;

        if (!item) return null;

        return {
          id: String(item.producto_id),
          nombre: item.titulo,
          vendedor: String(vendedor.nombre || "N/A"),
          marca: item.titulo.split(" ")[0] || "Marca Premium",
          precio: Math.round(Number(item.precio)) * 100 || 0,
          imagenesUrl: [item.imagen || "/placeholder-perfume.jpg"],
        };
      })
      .filter((prod) => prod !== null);

    return validarTipo(itemsMapeados, PerfumeCarritosSchema);
  } catch (error) {
    console.error(
      "Error general obteniendo carrito reales, usando Mock:",
      error,
    );
    return obtenerProductosCarritoMock(ids);
  }
}

export async function obtenerProductosComprados(
  ids: string[],
): Promise<PerfumeComprado[]> {
  if (!ids || ids.length === 0) return [];
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerProductosCompradosReal(ids);
  } else {
    return obtenerProductosCompradosMock(ids);
  }
}

async function obtenerProductosCompradosReal(
  ids: string[],
): Promise<PerfumeComprado[]> {
  try {
    const promesas = ids.map((id) =>
      fetchProductoDesdeSeller(id).catch((err) => {
        console.warn(`No se pudo cargar el producto ${id}:`, err.message);
        return null;
      }),
    );

    const resultadosRaw = await Promise.all(promesas);

    const productosValidos = resultadosRaw.filter((prod) => prod !== null);
    const itemsMapeados = productosValidos
      .map((prod) => {
        const item = prod.producto;
        const vendedor = prod.vendedor;

        if (!item) return null;

        return {
          id: String(item.producto_id),
          nombre: item.titulo,
          vendedor: vendedor.nombre || "N/A",
          imagenesUrl: [item.imagen || "/placeholder-perfume.jpg"],
        };
      })
      .filter((prod) => prod !== null);

    return validarTipo(itemsMapeados, PerfumeCompradosSchema);
  } catch (error) {
    console.error(
      "Error general obteniendo productos comprados reales, usando Mock:",
      error,
    );
    return obtenerProductosCompradosMock(ids);
  }
}

async function obtenerProductosCompradosMock(
  ids: String[],
): Promise<PerfumeComprado[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeCompradosSchema);
}

export async function obtenerDetallesProducto(
  ids: string[],
): Promise<Perfume[]> {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerDetallesProductoReal(ids);
  } else {
    return obtenerDetallesProductoMock(ids);
  }
}

async function obtenerDetallesProductoReal(ids: string[]): Promise<Perfume[]> {
  try {
    const promesas = ids.map((id) =>
      obtenerDetallePerfumeReal(id).catch((err) => {
        console.warn(
          `No se pudo cargar el detalle completo de ${id}:`,
          err.message,
        );
        return null;
      }),
    );

    const resultados = await Promise.all(promesas);

    const productosValidos = resultados.filter(
      (prod) => prod !== null,
    ) as Perfume[];

    return productosValidos;
  } catch (error) {
    console.error(
      "⚠️ Error general obteniendo detalles reales, usando Mock:",
      error,
    );
    return obtenerDetallesProductoMock(ids);
  }
}

async function obtenerDetallesProductoMock(ids: string[]): Promise<Perfume[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumesSchema);
}

export async function enviarResenaProducto(
  productoId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
  imagenes?: string[],
) {
  const usarApiReal = true;

  console.warn("Entrando a reseñar");
  if (usarApiReal) {
    console.warn("Usando api real");
    return enviarResenaProductoReal(
      productoId,
      ordenId,
      rating,
      comentario,
      imagenes,
    );
  } else {
    console.warn("Usando mock");
    return enviarResenaProductoMock(productoId, ordenId, rating, comentario);
  }
}

async function enviarResenaProductoMock(
  productoId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  console.log("POST a API Feedback MOCK (Producto):", {
    productoId,
    ordenId,
    rating,
    comentario,
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { estado: "success", mensaje: "Reseña simulada con éxito" };
}

export async function enviarResenaVendedor(
  vendedorId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  const usarApiReal = true;

  if (usarApiReal) {
    return enviarResenaVendedorReal(vendedorId, ordenId, rating, comentario);
  } else {
    return enviarResenaVendedorMock(vendedorId, ordenId, rating, comentario);
  }
}

async function enviarResenaVendedorMock(
  vendedorId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  console.log("POST a API Feedback MOCK (Vendedor):", {
    vendedorId,
    ordenId,
    rating,
    comentario,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { estado: "success", mensaje: "Reseña simulada con éxito" };
}

export async function obtenerHistorialEnvio(trackingId: string) {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal && trackingId) {
    return obtenerHistorialEnvioReal(trackingId);
  }
}

export async function obtenerPreciosDeProductos(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerPreciosDeProductosReal(ids);
  } else {
    return obtenerPreciosDeProductosMock(ids);
  }
}

async function obtenerPreciosDeProductosReal(ids: string[]) {
  try {
    const promesas = ids.map((id) =>
      fetchProductoDesdeSeller(id).catch((err) => {
        console.warn(
          `No se pudo cargar el precio del producto ${id}:`,
          err.message,
        );
        return null;
      }),
    );

    const resultadosRaw = await Promise.all(promesas);

    const preciosMapeados = resultadosRaw
      .filter((prod) => prod !== null)
      .map((prod) => ({
        id: String(prod.producto.producto_id),
        precio: Math.round(Number(prod.producto.precio)) * 100,
      }));

    return preciosMapeados;
  } catch (error) {
    console.error(
      "⚠️ Error crítico obteniendo precios reales, usando Mock:",
      error,
    );
    return obtenerPreciosDeProductosMock(ids);
  }
}

async function obtenerPreciosDeProductosMock(ids: string[]) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const preciosFiltrados = mockPerfumes
    .filter((perfume) => ids.includes(perfume.id))
    .map((perfume) => ({
      id: perfume.id,
      precio: perfume.precio,
    }));

  return preciosFiltrados;
}

export async function obtenerDetallesProductos(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerDetallesProductosReal(ids);
  } else {
    return obtenerDetallesProductosMock(ids);
  }
}

async function obtenerDetallesProductosReal(ids: string[]) {
  try {
    const promesas = ids.map((id) =>
      fetchProductoDesdeSeller(id).catch((err) => {
        console.warn(
          `No se pudo cargar el resumen del producto ${id}:`,
          err.message,
        );
        return null;
      }),
    );

    const resultadosRaw = await Promise.all(promesas);
    const resumenMapeado = resultadosRaw
      .filter((prod) => prod !== null)
      .map((prod) => ({
        id: String(prod.producto.producto_id),
        imagen: prod.producto.imagen || "/placeholder-perfume.jpg",
        nombre: prod.producto.titulo,
        vendedor: String(prod.vendedor.nombre || "Boutique Oficial"),
      }));

    return resumenMapeado;
  } catch (error) {
    console.error(
      "⚠️ Error obteniendo detalles básicos reales, usando Mock:",
      error,
    );
    return obtenerDetallesProductosMock(ids);
  }
}

async function obtenerDetallesProductosMock(ids: string[]) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return mockPerfumes
    .filter((perfume) => ids.includes(perfume.id))
    .map((perfume) => ({
      id: perfume.id,
      imagen: perfume.imagenesUrl[0],
      nombre: perfume.nombre,
      vendedor: perfume.vendedor,
    }));
}

export async function generarOrdenEnvio(
  id_orden: string,
  id_comprador: string,
  direccion_entrega: string,
  items: any[],
  servicio_elegido: any,
) {
  const usarApiReal = true;
  if (usarApiReal) {
    return generarOrdenEnvioReal(
      id_orden,
      id_comprador,
      direccion_entrega,
      items,
      servicio_elegido,
    );
  } else {
    return generarOrdenEnvioMock();
  }
}

async function generarOrdenEnvioReal(
  id_orden: string,
  id_comprador: string,
  direccion_entrega: string,
  items: any[],
  servicio_elegido: any,
) {
  try {
    let id_vendedor = "vendedor_desconocido";
    if (items && items.length > 0) {
      try {
        const { producto, vendedor } = await fetchProductoDesdeSeller(
          items[0].productoId,
        );
        if (vendedor.clerk_id) {
          id_vendedor = String(vendedor.clerk_id);
        }
      } catch (err) {
        console.warn("No se pudo obtener el id_vendedor, usando genérico.");
      }
    }

    const bodyData = {
      id_orden: id_orden,
      id_pedido: id_orden,
      id_comprador: id_comprador,
      id_vendedor: id_vendedor,
      direccion_entrega: direccion_entrega,
      items: items,
      servicio_elegido: servicio_elegido,
      usuarioId: "user_3EPf5YLDhCGrt6m1RgRzt6SCU8i",
    };

    const shippingBaseUrl =
      process.env.SHIPPING_API_URL ||
      "https://proyecto-c-shipping2-perfume-libre.vercel.app/api";

    const response = await fetch(`${shippingBaseUrl}/shipping/ordenes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(
        `Error al generar envío en Shipping App: ${response.status}`,
      );
    }

    const data = await response.json();

    return data.trackingId || `TRK-${id_orden.slice(-4)}`;
  } catch (error) {
    console.error("⚠️ Falló la creación del envío real, usando Mock:", error);
    return generarOrdenEnvioMock();
  }
}

async function generarOrdenEnvioMock() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `TRK_MOCK_${Math.floor(Math.random() * 10000)}`;
}

export async function obtenerCotizacionesEnvio(
  codigo_postal: string,
  direccion_entrega: string,
) {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal) {
    return obtenerCotizacionesEnvioReal(codigo_postal, direccion_entrega);
  } else {
    return obtenerCotizacionesEnvioMock();
  }
}
async function obtenerCotizacionesEnvioReal(
  codigo_postal: string,
  direccion_entrega: string,
) {
  try {
    const shippingBaseUrl =
      process.env.SHIPPING_API_URL ||
      "https://proyecto-c-shipping2-perfume-libre.vercel.app/api";

    const bodyData = {
      codigo_postal: codigo_postal,
      direccion_entrega: direccion_entrega,
    };

    const response = await fetch(`${shippingBaseUrl}/shipping/cotizar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error API Shipping al cotizar: ${response.status}`);
    }

    const data = await response.json();

    if (!data.opciones || !Array.isArray(data.opciones)) {
      throw new Error("La API de Shipping no devolvió el formato esperado");
    }

    return data.opciones;
  } catch (error) {
    console.error(
      "⚠️ Falló la cotización real, usando Mock de contingencia:",
      error,
    );
    return obtenerCotizacionesEnvioMock();
  }
}

export async function fetchProductoDesdeSeller(id: string) {
  const baseUrl =
    process.env.SELLER_API_URL ||
    "https://proyecto-c-seller-perfume-libre.vercel.app/api";
  const urlExacta = `${baseUrl}/seller/productos/${id}`;

  const headers = new Headers();
  headers.append("api_key", process.env.SELLER_API_KEY || "perfumelibre2026");

  const res = await fetch(urlExacta, {
    method: "GET",
    headers: headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Error API Seller al obtener producto ${id}: ${res.status}`,
    );
  }

  const data = await res.json();
  return { producto: data.producto, vendedor: data.vendedor };
}

export function validarTipo<TSchema extends z.ZodTypeAny>(
  data: unknown,
  schema: TSchema,
): z.infer<TSchema> {
  const resultado = schema.safeParse(data);

  if (!resultado.success) {
    throw new Error(`Datos invalidos: ${resultado.error.message}`);
  }

  return resultado.data;
}

export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get("api_key");
  return apiKey === process.env.BUYER_API_KEY;
}
