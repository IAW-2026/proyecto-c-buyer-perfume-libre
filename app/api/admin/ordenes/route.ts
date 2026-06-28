import { validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const ordenes = await prisma.ordenCompra.findMany({
      orderBy: { createdAt: "desc" },
    });

    const resultado = ordenes.map((orden) => ({
      id: orden.id,
      compradorId: orden.usuarioId,
      vendedorId: orden.vendedorId,
      fecha: orden.createdAt.toISOString(),
      total: orden.total,
      estadoPago: orden.pagoId ? "Pagado" : "Pendiente",
      estadoEnvio: orden.estado,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
