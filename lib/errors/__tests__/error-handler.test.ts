import test from "node:test";
import assert from "node:assert/strict";
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
  assert.equal(resApp.code, "CUSTOM_CODE");
  assert.equal(resApp.statusCode, 418);

  const errUnauth = new UnauthorizedError();
  const resUnauth = formatActionError(errUnauth);
  assert.equal(resUnauth.code, "UNAUTHORIZED");
  assert.equal(resUnauth.statusCode, 401);

  const errForbid = new ForbiddenError();
  const resForbid = formatActionError(errForbid);
  assert.equal(resForbid.code, "FORBIDDEN");
  assert.equal(resForbid.statusCode, 403);

  const errNotFound = new NotFoundError("Perfume", "123");
  const resNotFound = formatActionError(errNotFound);
  assert.equal(resNotFound.code, "NOT_FOUND");
  assert.equal(resNotFound.statusCode, 404);
  assert.match(resNotFound.message, /Perfume con ID '123' no encontrado/);

  const errConflict = new ConflictError("Ya está en favoritos");
  const resConflict = formatActionError(errConflict);
  assert.equal(resConflict.code, "CONFLICT");
  assert.equal(resConflict.statusCode, 409);

  const errValidation = new ValidationError("Campos inválidos", {
    email: ["Email requerido"],
  });
  const resValidation = formatActionError(errValidation);
  assert.equal(resValidation.code, "VALIDATION_ERROR");
  assert.equal(resValidation.statusCode, 400);
  assert.deepEqual(resValidation.fields, { email: ["Email requerido"] });

  const errExternal = new ExternalServiceError("Seller API");
  const resExternal = formatActionError(errExternal);
  assert.equal(resExternal.code, "EXTERNAL_SERVICE_ERROR");
  assert.equal(resExternal.statusCode, 503);
});

test("formatActionError: maneja ZodError extrayendo fields", () => {
  const schema = z.object({
    nombre: z.string().min(3),
    edad: z.number().int().positive(),
  });

  const parsed = schema.safeParse({ nombre: "a", edad: -5 });
  assert.equal(parsed.success, false);

  if (!parsed.success) {
    const res = formatActionError(parsed.error);
    assert.equal(res.code, "VALIDATION_ERROR");
    assert.equal(res.statusCode, 400);
    assert.ok(res.fields);
    assert.ok(res.fields.nombre);
    assert.ok(res.fields.edad);
  }
});

test("formatActionError: maneja errores conocidos de Prisma como fallback", () => {
  const prismaP2002 = { code: "P2002", clientVersion: "5.0.0" };
  const resP2002 = formatActionError(prismaP2002);
  assert.equal(resP2002.code, "CONFLICT");
  assert.equal(resP2002.statusCode, 409);

  const prismaP2025 = { code: "P2025", clientVersion: "5.0.0" };
  const resP2025 = formatActionError(prismaP2025);
  assert.equal(resP2025.code, "NOT_FOUND");
  assert.equal(resP2025.statusCode, 404);
});

test("formatActionError: sanitiza errores 500 inesperados", () => {
  const secretError = new Error("Connection failed postgres://user:secretpass@db:5432");
  const res = formatActionError(secretError, "test-cid-123");

  assert.equal(res.code, "INTERNAL_SERVER_ERROR");
  assert.equal(res.statusCode, 500);
  assert.equal(res.message, "Ocurrió un error inesperado al procesar la solicitud");
  assert.equal("secretpass" in res, false);
});

test("rethrowIfNavigationError: relanza errores con digest NEXT_REDIRECT o NEXT_NOT_FOUND", () => {
  const redirectErr = { digest: "NEXT_REDIRECT;replace;/login;307;" };
  assert.throws(
    () => rethrowIfNavigationError(redirectErr),
    (err: unknown) => (err as { digest: string }).digest === redirectErr.digest,
  );

  const notFoundErr = { digest: "NEXT_NOT_FOUND" };
  assert.throws(
    () => rethrowIfNavigationError(notFoundErr),
    (err: unknown) => (err as { digest: string }).digest === notFoundErr.digest,
  );

  // Un error común no debe ser relanzado
  const standardErr = new Error("Normal business error");
  assert.doesNotThrow(() => rethrowIfNavigationError(standardErr));
});

test("withApiHandler: maneja éxito y errores tipados en Route Handlers", async () => {
  // 1. Éxito
  const handlerExito = withApiHandler(async () => {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  const req1 = new Request("http://localhost/api/test");
  const res1 = await handlerExito(req1);
  assert.equal(res1.status, 200);

  // 2. Error tipado UnauthorizedError (401)
  const handlerUnauth = withApiHandler(async () => {
    throw new UnauthorizedError("Acceso no autorizado al recurso");
  });
  const req2 = new Request("http://localhost/api/test");
  const res2 = await handlerUnauth(req2);
  assert.equal(res2.status, 401);
  const data2 = await res2.json();
  assert.equal(data2.code, "UNAUTHORIZED");
  assert.equal(data2.error, "Acceso no autorizado al recurso");

  // 3. Error 500 inesperado con correlation ID preservado
  const handlerError = withApiHandler(async () => {
    throw new Error("Fallo de red crítico");
  });
  const req3 = new Request("http://localhost/api/test", {
    headers: { "x-correlation-id": "cid-custom-999" },
  });
  const res3 = await handlerError(req3);
  assert.equal(res3.status, 500);
  assert.equal(res3.headers.get("x-correlation-id"), "cid-custom-999");
  const data3 = await res3.json();
  assert.equal(data3.code, "INTERNAL_SERVER_ERROR");
  assert.equal(data3.error, "Ocurrió un error inesperado al procesar la solicitud");
});
