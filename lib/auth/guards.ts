import { auth } from "@clerk/nextjs/server";
import { RolUsuario } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor(message = "UNAUTHORIZED: Debes iniciar sesión") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "FORBIDDEN: Permisos insuficientes") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Exige que exista un usuario autenticado.
 * Retorna el `userId` de Clerk.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

/**
 * Exige que el usuario autenticado tenga rol de ADMIN.
 * Comprueba claims de sesión y valida contra la base de datos como fuente de verdad.
 * Retorna el `userId` de Clerk.
 */
export async function requireAdmin(): Promise<string> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }

  // Comprobar primero claim en sesión (rápido)
  if (sessionClaims?.metadata?.rol === "ADMIN") {
    return userId;
  }

  // Comprobar en base de datos (fuente de verdad)
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { rol: true },
  });

  if (usuario?.rol !== RolUsuario.ADMIN) {
    throw new ForbiddenError("FORBIDDEN: Permisos de administrador requeridos");
  }

  return userId;
}
