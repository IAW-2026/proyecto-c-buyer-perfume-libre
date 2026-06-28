import { validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ordenId = id;

  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    await prisma.ordenCompra.update({
      where: { id: ordenId },
      data: { estado: "Cancelado" },
    });

    return NextResponse.json([
      {
        status: "success",
        mensaje: `La orden ${ordenId} ha sido cancelada exitosamente`,
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
