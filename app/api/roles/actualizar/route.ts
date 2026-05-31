import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { actualizarRol } from "@/actions/usuario";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const rolSolicitado = searchParams.get("rol")?.toUpperCase();
  const nuevoRol =
    rolSolicitado === "USER" ? RolUsuario.USER : RolUsuario.ADMIN;

  if (secret !== "IAW") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión primero" },
      { status: 401 },
    );
  }

  try {
    await actualizarRol(user.id, nuevoRol);

    if (nuevoRol === RolUsuario.ADMIN) {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar usuario." },
      { status: 500 },
    );
  }
}
