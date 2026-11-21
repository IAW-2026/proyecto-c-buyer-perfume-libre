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
import {
  obtenerCotizacionesEnvioMock,
  obtenerHistorialSimulado,
} from "./mockEnvios";
import {
  enviarResenaProductoReal,
  enviarResenaVendedorReal,
} from "@/actions/resenas";
import { obtenerHistorialEnvioReal } from "@/actions/tracking";
import { sellerClient } from "@/lib/integrations/seller-client";
import { shippingClient } from "@/lib/integrations/shipping-client";
import { feedbackClient } from "@/lib/integrations/feedback-client";

// TODO: Refactorizar este archivo

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
    const { q, marca, genero, precioMin, precioMax, page, limit } =
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

    const data = await sellerClient.obtenerProductos({
      titulo: q ? q.toString() : undefined,
      categorias,
      page: page || 1,
      limit: limit || 12,
    });

    let itemsMapeados: PerfumeCard[] = (data.items || []).map((prod) => ({
      id: String(prod.producto_id),
      nombre: prod.titulo,
      precio: Math.round(Number(prod.precio)) * 100,
      imagenUrl: prod.imagen || "/placeholder-perfume.jpg",
      marca: prod.titulo.split(" ")[0] || "Marca Desconocida",
      tamaño: 100,
      calificacion: 0,
    }));

    try {
      const promesasCalificaciones = itemsMapeados.map((item) =>
        feedbackClient.obtenerResumenProducto(item.id).catch(() => null),
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
    const dataSeller = await sellerClient.obtenerProductoPorId(id);

    const dataProducto = dataSeller.producto;
    const vendedorId = String(
      dataSeller.producto?.vendedor_id || "Boutique Oficial",
    );

    let calificacionProducto = 0;
    let calificacionVendedor = 0;

    try {
      const [resProducto, resVendedor] = await Promise.allSettled([
        feedbackClient.obtenerResumenProducto(id),
        feedbackClient.obtenerResumenVendedor(vendedorId),
      ]);

      if (resProducto.status === "fulfilled" && resProducto.value) {
        calificacionProducto = Number(resProducto.value.promedio_producto) || 0;
      }

      if (resVendedor.status === "fulfilled" && resVendedor.value) {
        calificacionVendedor = Number(resVendedor.value.promedio_vendedor) || 0;
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
      vendedor: dataSeller.vendedor?.nombre || "Vendedor Oficial",
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

  const mapa = await obtenerSnapshotsProductos(ids);
  const items = Array.from(mapa.values()).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    vendedor: s.vendedor,
    imagenesUrl: [s.imagenUrl],
  }));

  return validarTipo(items, PerfumeCompradosSchema);
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

export async function obtenerHistorialEnvio(
  trackingId: string,
  estado?: string,
) {
  const usarApiReal = process.env.USE_REAL_API === "true";

  if (usarApiReal && trackingId) {
    return obtenerHistorialEnvioReal(trackingId, estado);
  } else {
    return obtenerHistorialSimulado(estado || "PAGADO");
  }
}

export interface SnapshotProducto {
  id: string;
  nombre: string;
  marca: string;
  imagenUrl: string;
  vendedor: string;
  vendedorClerkId?: string;
  precioCentavos: number;
}

export async function obtenerSnapshotsProductos(
  ids: string[],
): Promise<Map<string, SnapshotProducto>> {
  if (!ids || ids.length === 0) return new Map();

  const uniqueIds = Array.from(new Set(ids));
  const usarApiReal = process.env.USE_REAL_API === "true";
  const mapa = new Map<string, SnapshotProducto>();

  if (!usarApiReal) {
    for (const id of uniqueIds) {
      const mockP = mockPerfumes.find((p) => p.id === id);
      if (mockP) {
        mapa.set(id, {
          id: mockP.id,
          nombre: mockP.nombre,
          marca:
            mockP.marca || mockP.nombre.split(" ")[0] || "Marca Desconocida",
          imagenUrl: mockP.imagenesUrl[0] || "/placeholder-perfume.jpg",
          vendedor: mockP.vendedor || "Boutique Oficial",
          vendedorClerkId: "user_3EXlfKfNj061hH7lOCEhs7Wg7qy",
          precioCentavos: mockP.precio,
        });
      }
    }
    return mapa;
  }

  // API Real: Consultar en paralelo los IDs únicos
  const resultados = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const data = await sellerClient.obtenerProductoPorId(id);
        if (!data?.producto) return null;
        const prod = data.producto;
        const vend = data.vendedor;
        const precioCentavos = Math.round(Number(prod.precio) * 100);

        if (isNaN(precioCentavos) || precioCentavos <= 0) {
          console.warn(`Producto ${id} devuelto por Seller sin precio válido.`);
          return null;
        }

        const snapshot: SnapshotProducto = {
          id: String(prod.producto_id || prod.id || id),
          nombre: prod.titulo || "Perfume Premium",
          marca:
            (prod as { marca?: string }).marca ||
            prod.titulo.split(" ")[0] ||
            "Marca Desconocida",
          imagenUrl:
            prod.imagen ||
            (prod.imagenes && prod.imagenes[0]) ||
            "/placeholder-perfume.jpg",
          vendedor: vend?.nombre || "Vendedor Oficial",
          vendedorClerkId: vend?.clerk_id || "user_3EXlfKfNj061hH7lOCEhs7Wg7qy",
          precioCentavos,
        };
        return snapshot;
      } catch (err) {
        console.warn(`Error al obtener snapshot para producto ${id}:`, err);
        return null;
      }
    }),
  );

  for (const s of resultados) {
    if (s) {
      mapa.set(s.id, s);
    }
  }

  return mapa;
}

export async function obtenerPreciosDeProductos(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const mapa = await obtenerSnapshotsProductos(ids);
  return Array.from(mapa.values()).map((s) => ({
    id: s.id,
    precio: s.precioCentavos,
  }));
}

export async function obtenerDetallesProductos(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const mapa = await obtenerSnapshotsProductos(ids);
  return Array.from(mapa.values()).map((s) => ({
    id: s.id,
    imagen: s.imagenUrl,
    nombre: s.nombre,
    vendedor: s.vendedor,
  }));
}

export async function generarOrdenEnvio(
  id_orden: string,
  id_comprador: string,
  direccion_entrega: string,
  items: Array<{ productoId: string; cantidad: number; precio: number } | Record<string, unknown>>,
  servicio_elegido: Record<string, unknown>,
) {
  const usarApiReal = process.env.USE_REAL_API === "true";

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
  items: Array<{ productoId: string; cantidad: number; precio: number } | Record<string, unknown>>,
  servicio_elegido: Record<string, unknown>,
) {
  try {
    let id_vendedor = "vendedor_desconocido";
    if (items && items.length > 0) {
      try {
        const itemPrimero = items[0] as { productoId?: string };
        if (itemPrimero.productoId) {
          const { vendedor } = await fetchProductoDesdeSeller(
            itemPrimero.productoId,
          );
          if (vendedor?.clerk_id) {
            id_vendedor = String(vendedor.clerk_id);
          }
        }
      } catch {
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

    const data = await shippingClient.crearOrdenEnvio(bodyData);

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
    return await shippingClient.obtenerCotizaciones(
      codigo_postal,
      direccion_entrega,
    );
  } catch (error) {
    console.error(
      "⚠️ Falló la cotización real, usando Mock de contingencia:",
      error,
    );
    return obtenerCotizacionesEnvioMock();
  }
}

export async function fetchProductoDesdeSeller(id: string) {
  const usarApiReal = process.env.USE_REAL_API === "true";
  if (!usarApiReal) {
    const mockP = mockPerfumes.find((p) => p.id === id);
    if (!mockP) {
      throw new Error(`Perfume mock con ID ${id} no encontrado`);
    }
    return {
      producto: {
        producto_id: mockP.id,
        titulo: mockP.nombre,
        descripcion: mockP.descripcion || "",
        precio: mockP.precio / 100,
        imagen: mockP.imagenesUrl[0] || "/placeholder-perfume.jpg",
      },
      vendedor: {
        nombre: mockP.vendedor,
        clerk_id: "user_3EXlfKfNj061hH7lOCEhs7Wg7qy",
      },
    };
  }

  const data = await sellerClient.obtenerProductoPorId(id);
  return {
    producto: data.producto,
    vendedor: data.vendedor ?? {
      nombre: "Vendedor Oficial",
      clerk_id: "user_3EXlfKfNj061hH7lOCEhs7Wg7qy",
    },
  };
}

export async function obtenerAccessTokenVendedor(idVendedor: string) {
  const usarApiReal = process.env.USE_REAL_API === "true";
  console.log("Obteniendo access token para vendedor:", idVendedor);
  if (usarApiReal) {
    return obtenerAccessTokenVendedorReal(idVendedor);
  } else {
    return obtenerAccessTokenVendedorMock();
  }
}

async function obtenerAccessTokenVendedorReal(idVendedor: string) {
  return sellerClient.obtenerAccessTokenVendedor(idVendedor);
}

async function obtenerAccessTokenVendedorMock() {
  console.log("Usando access token mock para vendedor");
  return process.env.MP_ACCESS_TOKEN!;
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
