import { unstable_rethrow } from "next/navigation";

/**
 * Next.js implementa redirecciones y notFound() arrojando excepciones internas
 * con digests específicos (ej. NEXT_REDIRECT, NEXT_NOT_FOUND).
 * Esta función garantiza que si una excepción corresponde al control de flujo
 * interno de Next.js, se relance de inmediato para no romper el framework.
 */
export function rethrowIfNavigationError(error: unknown): void {
  // Primero intentamos la API oficial de Next.js
  unstable_rethrow(error);

  // Fallback defensivo por si el error tiene digest de Next.js
  if (error && typeof error === "object" && "digest" in error) {
    const digest = String((error as { digest?: unknown }).digest ?? "");
    if (
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND") ||
      digest.startsWith("DYNAMIC_SERVER_USAGE")
    ) {
      throw error;
    }
  }
}
