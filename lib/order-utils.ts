/**
 * Utilidades puras de órdenes y estados.
 * Sin dependencias de servidor, red ni base de datos.
 */

import {
  EstadoOrdenType,
  EstadosOrden,
  itemsDeOrdenDb,
} from "@/schema/perfume.schema";

export function calcularTotalProductos(items: itemsDeOrdenDb): number {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

export function obtenerLabelEstado(estado: EstadoOrdenType): string {
  switch (estado) {
    case EstadosOrden.enum.PENDIENTE:
      return "Pendiente de Pago";
    case EstadosOrden.enum.PAGADO:
      return "Pagado";
    case EstadosOrden.enum.PREPARANDO:
      return "En Preparación";
    case EstadosOrden.enum.EN_TRANSITO:
      return "En Camino";
    case EstadosOrden.enum.ENTREGADO:
      return "Entregado";
    case EstadosOrden.enum.CANCELADO:
      return "Cancelado";
    default:
      return estado;
  }
}
