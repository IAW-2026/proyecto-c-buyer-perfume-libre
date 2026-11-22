import { NextResponse } from "next/server";
import { formatActionError } from "./error-handler";
import { rethrowIfNavigationError } from "./navigation-guard";

export type ApiHandlerContext<TParams = Record<string, string>> = {
  params: Promise<TParams>;
};

/**
 * Envoltorio para Route Handlers de Next.js (app/api/.../route.ts).
 * Captura excepciones, relanza errores de navegación interna, registra fallos inesperados
 * en el servidor con correlationId y devuelve una respuesta HTTP tipada con status code semántico.
 */
export function withApiHandler<TParams = Record<string, string>>(
  handler: (
    req: Request,
    context?: ApiHandlerContext<TParams>,
  ) => Promise<Response>,
): (req: Request, context?: ApiHandlerContext<TParams>) => Promise<Response> {
  return async (req: Request, context?: ApiHandlerContext<TParams>) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      rethrowIfNavigationError(error);

      const correlationId =
        req.headers.get("x-correlation-id") ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "api-error");

      const payload = formatActionError(error, correlationId);

      return NextResponse.json(
        {
          error: payload.message,
          code: payload.code,
          ...(payload.fields ? { fields: payload.fields } : {}),
        },
        {
          status: payload.statusCode,
          headers: {
            "x-correlation-id": correlationId,
          },
        },
      );
    }
  };
}
