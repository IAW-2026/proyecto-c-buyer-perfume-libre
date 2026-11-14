import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const rolSolicitado = searchParams.get("rol")?.toUpperCase();
  const nuevoRol =
    rolSolicitado === "USER" ? RolUsuario.USER : RolUsuario.ADMIN;

  if (secret !== "IAW") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Inicia sesión primero" },
      { status: 401 },
    );
  }

  try {
    const client = await clerkClient();

    // Actualizar DB y Clerk en paralelo
    await Promise.all([
      prisma.usuario.upsert({
        where: { id: userId },
        update: { rol: nuevoRol },
        create: {
          id: userId,
          rol: nuevoRol,
        },
      }),
      client.users.updateUserMetadata(userId, {
        publicMetadata: {
          rol: nuevoRol,
        },
      }),
    ]);

    if (nuevoRol === RolUsuario.ADMIN) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error: unknown) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario." },
      { status: 500 },
    );
  }
}
