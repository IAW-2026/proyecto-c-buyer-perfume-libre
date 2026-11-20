/**
 * Utilidades monetarias puras para conversiones y formateo.
 * Sin dependencias de base de datos, red o servidor.
 */

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

export function pesosACentavos(valorPesos: string | number): number {
  const numero =
    typeof valorPesos === "string" ? Number(valorPesos) : valorPesos;
  return Math.round(numero * 100);
}

export function centavosAPesos(centavos: number): number {
  return centavos / 100;
}

// Comisión estimada de la plataforma / gateway (10% del monto)
export function obtenerComision(montoEnPesos: number): number {
  const comision = montoEnPesos * 0.1;
  return Math.round(comision);
}
