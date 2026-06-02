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
import { obtenerHistorialSimulado, OpcionEnvio } from "./mockEnvios";

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
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { q, marca, genero, tamano, precioMin, precioMax, page, limit } =
    filtros;

  // Filtrado simulado, en etapa 3 esto lo hará la API.
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
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 quitar esta parte y usar el resultado del fetch
  const perfume = mockPerfumes.find((p) => p.id === id);
  if (!perfume) {
    throw new Error("Perfume no encontrado");
  }

  return validarTipo(perfume, PerfumeSchema);
}

export async function obtenerResenaVendedor(id_vendedor: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { total: 127, promedio: 4.8 };
}

export async function obtenerResenaProducto(id_producto: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { total: 127, promedio: 4.8 };
}

export async function obtenerProductosFavoritos(
  ids: string[],
): Promise<PerfumeFavorito[]> {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 cambiar esta parte y usar el resultado del fetch
  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeFavoritosSchema);
}

export async function obtenerProductosCarrito(
  ids: string[],
): Promise<PerfumeCarrito[]> {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 cambiar esta parte y usar el resultado del fetch
  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeCarritosSchema);
}

export async function obtenerProductosComprados(
  ids: String[],
): Promise<PerfumeComprado[]> {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 cambiar esta parte y usar el resultado del fetch
  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumeCompradosSchema);
}

export async function obtenerDetallesProducto(
  ids: string[],
): Promise<Perfume[]> {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 cambiar esta parte y usar el resultado del fetch
  const perfumesFiltrados = mockPerfumes.filter((perfume) =>
    ids.includes(perfume.id),
  );

  return validarTipo(perfumesFiltrados, PerfumesSchema);
}

export async function enviarResenaProducto(
  productoId: string,
  usuarioId: string,
  rating: number,
  comentario?: string,
) {
  console.log("POST a API Feedback (Producto):", {
    productoId: productoId,
    usuarioId: usuarioId,
    rating,
    comentario,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function enviarResenaVendedor(
  vendedorId: string,
  usuarioId: string,
  rating: number,
  comentario?: string,
) {
  console.log("POST a API Feedback (Vendedor):", {
    vendedorId: vendedorId,
    usuarioId: usuarioId,
    rating,
    comentario,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function obtenerHistorialEnvio(estado: string) {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // En etapa 3 cambiar esta parte y usar el resultado del fetch
  return obtenerHistorialSimulado(estado);
}

export async function obtenerPreciosDeProductos(ids: string[]) {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const preciosFiltrados = mockPerfumes
    .filter((perfume) => ids.includes(perfume.id))
    .map((perfume) => ({
      id: perfume.id,
      precio: perfume.precio,
    }));

  return preciosFiltrados;
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

// TODO: Charlar con el equipo acerca de los parametros. El id_vendedor no lo tengo deberia pedirlo y
// puede ser distinto por cada producto.
export async function generarOrden(
  id_orden: string,
  id_comprador: string,
  direccion_entrega: string,
  items: any[],
  id_vendedor: string,
  servicio_elegido: OpcionEnvio,
) {
  // Simulación de generación de orden de shipping app, devuelve el id track.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `envio_mock_${Math.floor(Math.random() * 10000)}`;
}
