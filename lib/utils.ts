import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./money";
export * from "./order-utils";

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
