import { obtenerComprasDelUsuario } from "@/actions/compras";
import { obtenerProductosComprados } from "@/lib/api";
import {
  ItemOrdenDetalle,
  OrdenAgrupada,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import { z } from "zod";

/**
 * Servicio de servidor para la consulta del historial de compras del usuario.
 * Prioriza los snapshots históricos inmutables persistidos en ItemOrdenCompra.
 * Si existen órdenes legacy sin snapshot, realiza una consulta batch agrupando IDs únicos
 * evitando cualquier problema de N+1 hacia Seller API.
 */
export async function obtenerHistorialDelUsuario(): Promise<OrdenAgrupada[] | null> {
  const comprasDb = await obtenerComprasDelUsuario();

  const comprasDbValidadas = z
    .array(OrdenDeCompraDbSchema)
    .parse(comprasDb);

  if (comprasDbValidadas.length === 0) {
    return null;
  }

  // Identificar qué productos NO cuentan con snapshot histórico (órdenes legacy)
  const legacyIds = Array.from(
    new Set(
      comprasDbValidadas
        .flatMap((orden) => orden.items)
        .filter((item) => !item.nombre || !item.imagenUrl)
        .map((item) => item.productoId),
    ),
  );

  let legacyMap = new Map<string, PerfumeComprado>();
  if (legacyIds.length > 0) {
    try {
      // Fallback batch agrupando IDs únicos: sin N+1
      const detallePerfumesLegacy = await obtenerProductosComprados(legacyIds);
      legacyMap = new Map(detallePerfumesLegacy.map((p) => [p.id, p]));
    } catch (err) {
      console.warn("⚠️ Falló el enriquecimiento batch de órdenes legacy desde Seller:", err);
    }
  }

  return fusionarCompradoConSnapshots(comprasDbValidadas, legacyMap);
}

export function fusionarCompradoConSnapshots(
  compradoDb: OrdenDeCompraDb[],
  legacyMap: Map<string, PerfumeComprado> = new Map(),
): OrdenAgrupada[] {
  const historialAgrupado: OrdenAgrupada[] = compradoDb.map((orden) => {
    const itemsProcesados: ItemOrdenDetalle[] = orden.items.map((item) => {
      const fallback = legacyMap.get(item.productoId);
      return {
        itemId: item.id,
        productoId: item.productoId,
        nombre: item.nombre ?? fallback?.nombre ?? "Perfume Adquirido",
        vendedor: item.vendedor ?? fallback?.vendedor ?? "Vendedor Oficial",
        imagenUrl: item.imagenUrl ?? fallback?.imagenUrl ?? "/placeholder-perfume.jpg",
        precioHistorico: item.precio,
        cantidad: item.cantidad,
      };
    });

    const productosComprados = orden.items.reduce(
      (acc, item) => acc + item.cantidad,
      0,
    );

    return {
      ordenId: orden.id,
      fecha: orden.createdAt,
      estado: orden.estado,
      items: itemsProcesados,
      productosComprados: productosComprados,
    };
  });

  return historialAgrupado;
}

// Compatibilidad retroactiva con helpers de historial
export const fusionarCompradoConDetalles = fusionarCompradoConSnapshots;

export function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
