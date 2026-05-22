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
  console.log({ centavos, cantidad });
  const pesos = (centavos * cantidad) / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(pesos);
}
