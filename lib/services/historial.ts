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
 * Servicio de servidor para la consulta y enriquecimiento del historial de compras del usuario.
 * Fusiona las órdenes persistidas en base de datos con los datos en tiempo real de Seller API.
 */
export async function obtenerHistorialDelUsuario(): Promise<OrdenAgrupada[] | null> {
  const comprasDb = await obtenerComprasDelUsuario();

  const comprasDbValidadas = z
    .array(OrdenDeCompraDbSchema)
    .parse(comprasDb);

  if (comprasDbValidadas.length === 0) {
    return null;
  }

  const perfumesCompradosId = obtenerIdComprados(comprasDbValidadas);

  const detallePerfumesComprados =
    await obtenerProductosComprados(perfumesCompradosId);

  return fusionarCompradoConDetalles(
    comprasDbValidadas,
    detallePerfumesComprados,
  );
}

export function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): OrdenAgrupada[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialAgrupado: OrdenAgrupada[] = compradoDb.map((orden) => {
    const itemsProcesados: ItemOrdenDetalle[] = orden.items.map((item) => {
      const detalleCatalogo = detallesMap.get(item.productoId);
      return {
        itemId: item.id,
        productoId: item.productoId,
        nombre: detalleCatalogo?.nombre ?? "Producto no disponible",
        vendedor: detalleCatalogo?.vendedor ?? "Desconocido",
        imagenUrl: detalleCatalogo?.imagenUrl ?? "/placeholder-perfume.jpg",
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

export function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
