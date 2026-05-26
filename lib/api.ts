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
} from "@/schema/perfume.schema";
import { mockPerfumes } from "./mockPerfumes";
import { z } from "zod";
import { obtenerHistorialSimulado } from "./mockEnvios";

export async function obtenerCatalogo(): Promise<PerfumeCard[]> {
  // En etapa 3 cambiar por fetch a la API real.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return validarTipo(mockPerfumes, PerfumeCardsSchema);
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
