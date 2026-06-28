import { validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        compras: true,
        direcciones: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const comprasTotales = usuario.compras.length;
    const gastadoTotal = usuario.compras.reduce(
      (acc, compra) => acc + compra.total,
      0,
    );
    const direcciones = usuario.direcciones.length;

    return NextResponse.json([
      {
        comprasTotales,
        gastadoTotal,
        direcciones,
      },
    ]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
