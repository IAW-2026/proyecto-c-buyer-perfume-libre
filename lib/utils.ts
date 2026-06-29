import { itemsDeOrdenDb } from "@/schema/perfume.schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
