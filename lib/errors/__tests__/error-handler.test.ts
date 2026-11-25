import { test, expect } from "vitest";
import { z } from "zod";
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ExternalServiceError,
} from "../domain-errors";
import { formatActionError } from "../error-handler";
import { rethrowIfNavigationError } from "../navigation-guard";
import { withApiHandler } from "../api-handler";

test("formatActionError: maneja AppError y sus subtipos", () => {
  const errApp = new AppError("Error personalizado", "CUSTOM_CODE", 418);
  const resApp = formatActionError(errApp);
  expect(resApp.code).toBe("CUSTOM_CODE");
  expect(resApp.statusCode).toBe(418);

  const errUnauth = new UnauthorizedError();
  const resUnauth = formatActionError(errUnauth);
  expect(resUnauth.code).toBe("UNAUTHORIZED");
  expect(resUnauth.statusCode).toBe(401);

  const errForbid = new ForbiddenError();
  const resForbid = formatActionError(errForbid);
  expect(resForbid.code).toBe("FORBIDDEN");
  expect(resForbid.statusCode).toBe(403);

  const errNotFound = new NotFoundError("Perfume", "123");
  const resNotFound = formatActionError(errNotFound);
  expect(resNotFound.code).toBe("NOT_FOUND");
  expect(resNotFound.statusCode).toBe(404);
  expect(resNotFound.message).toMatch(/Perfume con ID '123' no encontrado/);

  const errConflict = new ConflictError("Ya está en favoritos");
  const resConflict = formatActionError(errConflict);
  expect(resConflict.code).toBe("CONFLICT");
  expect(resConflict.statusCode).toBe(409);

  const errValidation = new ValidationError("Campos inválidos", {
    email: ["Email requerido"],
  });
  const resValidation = formatActionError(errValidation);
  expect(resValidation.code).toBe("VALIDATION_ERROR");
  expect(resValidation.statusCode).toBe(400);
  expect(resValidation.fields).toEqual({ email: ["Email requerido"] });

  const errExternal = new ExternalServiceError("Seller API");
  const resExternal = formatActionError(errExternal);
  expect(resExternal.code).toBe("EXTERNAL_SERVICE_ERROR");
  expect(resExternal.statusCode).toBe(503);
});

test("formatActionError: maneja ZodError extrayendo fields", () => {
  const schema = z.object({
    nombre: z.string().min(3),
    edad: z.number().int().positive(),
  });

  const parsed = schema.safeParse({ nombre: "a", edad: -5 });
  expect(parsed.success).toBe(false);

  if (!parsed.success) {
    const res = formatActionError(parsed.error);
    expect(res.code).toBe("VALIDATION_ERROR");
    expect(res.statusCode).toBe(400);
    expect(res.fields).toBeDefined();
    expect(res.fields?.nombre).toBeDefined();
    expect(res.fields?.edad).toBeDefined();
  }
});

test("formatActionError: maneja errores conocidos de Prisma como fallback", () => {
  const prismaP2002 = { code: "P2002", clientVersion: "5.0.0" };
  const resP2002 = formatActionError(prismaP2002);
  expect(resP2002.code).toBe("CONFLICT");
  expect(resP2002.statusCode).toBe(409);

  const prismaP2025 = { code: "P2025", clientVersion: "5.0.0" };
  const resP2025 = formatActionError(prismaP2025);
  expect(resP2025.code).toBe("NOT_FOUND");
  expect(resP2025.statusCode).toBe(404);
});

test("formatActionError: sanitiza errores 500 inesperados", () => {
  const secretError = new Error("Connection failed postgres://user:secretpass@db:5432");
  const res = formatActionError(secretError, "test-cid-123");

  expect(res.code).toBe("INTERNAL_SERVER_ERROR");
  expect(res.statusCode).toBe(500);
  expect(res.message).toBe("Ocurrió un error inesperado al procesar la solicitud");
  expect("secretpass" in res).toBe(false);
});

test("rethrowIfNavigationError: relanza errores con digest NEXT_REDIRECT o NEXT_NOT_FOUND", () => {
  const redirectErr = { digest: "NEXT_REDIRECT;replace;/login;307;" };
  expect(() => rethrowIfNavigationError(redirectErr)).toThrow();

  const notFoundErr = { digest: "NEXT_NOT_FOUND" };
  expect(() => rethrowIfNavigationError(notFoundErr)).toThrow();

  // Un error común no debe ser relanzado
  const standardErr = new Error("Normal business error");
  expect(() => rethrowIfNavigationError(standardErr)).not.toThrow();
});

test("withApiHandler: maneja éxito y errores tipados en Route Handlers", async () => {
  // 1. Éxito
  const handlerExito = withApiHandler(async () => {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  const req1 = new Request("http://localhost/api/test");
  const res1 = await handlerExito(req1);
  expect(res1.status).toBe(200);

  // 2. Error tipado UnauthorizedError (401)
  const handlerUnauth = withApiHandler(async () => {
    throw new UnauthorizedError("Acceso no autorizado al recurso");
  });
  const req2 = new Request("http://localhost/api/test");
  const res2 = await handlerUnauth(req2);
  expect(res2.status).toBe(401);
  const data2 = await res2.json();
  expect(data2.code).toBe("UNAUTHORIZED");
  expect(data2.error).toBe("Acceso no autorizado al recurso");

  // 3. Error 500 inesperado con correlation ID preservado
  const handlerError = withApiHandler(async () => {
    throw new Error("Fallo de red crítico");
  });
  const req3 = new Request("http://localhost/api/test", {
    headers: { "x-correlation-id": "cid-custom-999" },
  });
  const res3 = await handlerError(req3);
  expect(res3.status).toBe(500);
  expect(res3.headers.get("x-correlation-id")).toBe("cid-custom-999");
  const data3 = await res3.json();
  expect(data3.code).toBe("INTERNAL_SERVER_ERROR");
  expect(data3.error).toBe("Ocurrió un error inesperado al procesar la solicitud");
});
