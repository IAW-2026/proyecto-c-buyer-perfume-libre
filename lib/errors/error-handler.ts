import { ZodError } from "zod";
import { AppError, ValidationError } from "./domain-errors";
import type { ActionErrorPayload } from "./action-result";

/**
 * Función PURA: nunca lanza excepciones.
 * Transforma cualquier error capturado en un ActionErrorPayload seguro para el cliente.
 * Si es un error inesperado (500), loguea el stack en el servidor y retorna
 * un mensaje sanitizado sin filtrar detalles de BD o arquitectura.
 */
export function formatActionError(
  error: unknown,
  correlationId?: string,
): ActionErrorPayload {
  const cid =
    correlationId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "unknown-cid");

  // 1. Error de Dominio tipado (AppError)
  if (error instanceof AppError) {
    const fields = error instanceof ValidationError ? error.fields : undefined;
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(fields ? { fields } : {}),
    };
  }

  // 2. Error de Validación Zod
  if (error instanceof ZodError) {
    const flattened = error.flatten();
    return {
      code: "VALIDATION_ERROR",
      message: "Los datos enviados son inválidos",
      statusCode: 400,
      fields: flattened.fieldErrors as Record<string, string[]>,
    };
  }

  // 3. Fallback genérico para errores conocidos de Prisma (red de seguridad)
  if (error && typeof error === "object" && "code" in error) {
    const prismaCode = String((error as { code: unknown }).code);
    if (prismaCode === "P2002") {
      return {
        code: "CONFLICT",
        message: "Ya existe un registro con esos datos",
        statusCode: 409,
      };
    }
    if (prismaCode === "P2025") {
      return {
        code: "NOT_FOUND",
        message: "El registro solicitado no fue encontrado",
        statusCode: 404,
      };
    }
  }

  // 4. Errores inesperados o genéricos (500)
  // Se loguea el stack trace completo con correlation ID en servidor
  console.error(`[UNEXPECTED_ACTION_ERROR] [cid: ${cid}]:`, error);

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: "Ocurrió un error inesperado al procesar la solicitud",
    statusCode: 500,
  };
}
