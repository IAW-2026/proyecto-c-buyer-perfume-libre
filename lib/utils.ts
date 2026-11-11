import { obtenerComprasDelUsuario } from "@/actions/compras";
import {
  EstadoOrdenType,
  EstadosOrden,
  ItemOrdenDetalle,
  itemsDeOrdenDb,
  OrdenAgrupada,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
import { obtenerProductosComprados } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generarUrl(nombre: string, id: string): string {
  const auxnombre = nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${auxnombre}-${id}`;
}

export function formatearPrecio(
  centavos: number,
  cantidad: number = 1,
): string {
  const pesos = (centavos * cantidad) / 100;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function calcularTotalProductos(items: itemsDeOrdenDb): number {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

export function pesosACentavos(valorPesos: string | number): number {
  const numero =
    typeof valorPesos === "string" ? Number(valorPesos) : valorPesos;
  return Math.round(numero * 100);
}

export function centavosAPesos(centavos: number): number {
  return centavos / 100;
}

export function obtenerLabelEstado(estado: EstadoOrdenType) {
  if (estado === EstadosOrden.enum.PENDIENTE) return "Pendiente de Pago";
  if (estado === EstadosOrden.enum.PAGADO) return "Pagado";
  if (estado === EstadosOrden.enum.PREPARANDO) return "En Preparación";
  if (estado === EstadosOrden.enum.EN_TRANSITO) return "En Camino";
  if (estado === EstadosOrden.enum.ENTREGADO) return "Entregado";
  if (estado === EstadosOrden.enum.CANCELADO) return "Cancelado";
}

// Calculamos la comisión de Mercado Pago (10% del monto)
export function obtenerComision(montoEnPesos: number): number {
  const comision = montoEnPesos * 0.1;
  return Math.round(comision);
}

export async function obtenerHistorialDelUsuario() {
  const obtenerComprasDb = await obtenerComprasDelUsuario();

  const obtenerComprasDbValidado = z
    .array(OrdenDeCompraDbSchema)
    .parse(obtenerComprasDb);

  if (obtenerComprasDbValidado.length === 0) {
    return null;
  }

  const perfumesCompradosId = obtenerIdComprados(obtenerComprasDbValidado);

  const detallePerfumesComprados =
    await obtenerProductosComprados(perfumesCompradosId);

  return fusionarCompradoConDetalles(
    obtenerComprasDbValidado,
    detallePerfumesComprados,
  );
}

function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): OrdenAgrupada[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialAgrupado: OrdenAgrupada[] = compradoDb.map((orden) => {
    const itemsProcesados: ItemOrdenDetalle[] = orden.items.map((item) => {
      const detalleCatálogo = detallesMap.get(item.productoId);
      return {
        itemId: item.id,
        productoId: item.productoId,
        nombre: detalleCatálogo?.nombre ?? "Producto no disponible",
        vendedor: detalleCatálogo?.vendedor ?? "Desconocido",
        imagenUrl: detalleCatálogo?.imagenUrl ?? "/placeholder-perfume.jpg",
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

function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
