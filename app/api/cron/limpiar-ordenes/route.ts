import { prisma } from "@/lib/prisma";
import { EstadosOrden } from "@/schema/perfume.schema";
import { withApiHandler, UnauthorizedError } from "@/lib/errors";
import { NextResponse } from "next/server";

export const GET = withApiHandler(async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new UnauthorizedError("No autorizado");
  }

  const haceDosDias = new Date();
  haceDosDias.setHours(haceDosDias.getHours() - 48);

  const resultado = await prisma.ordenCompra.updateMany({
    where: {
      estado: EstadosOrden.enum.PENDIENTE,
      createdAt: {
        lt: haceDosDias,
      },
    },
    data: {
      estado: EstadosOrden.enum.CANCELADO,
    },
  });

  return NextResponse.json({
    success: true,
    mensaje: `Se limpiaron ${resultado.count} órdenes fantasmas.`,
  });
});
