import { validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { withApiHandler, UnauthorizedError } from "@/lib/errors";
import { NextResponse } from "next/server";

export const GET = withApiHandler(async (req: Request) => {
  if (!validateApiKey(req)) {
    throw new UnauthorizedError("No autorizado");
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit")) || 50),
    100,
  );
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const ordenes = await prisma.ordenCompra.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });

  const resultado = ordenes.map((orden) => ({
    id: orden.id,
    compradorId: orden.usuarioId,
    vendedorId: orden.vendedorId,
    fecha: orden.createdAt.toISOString(),
    total: orden.total,
    estadoPago: orden.pagoId ? "PAGADO" : "PENDIENTE",
    estadoEnvio: orden.estado,
  }));

  return NextResponse.json({
    data: resultado,
    pagination: {
      limit,
      offset,
      totalEnLote: resultado.length,
    },
  });
});
