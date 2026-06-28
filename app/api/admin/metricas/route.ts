import { validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const usuariosTotales = await prisma.usuario.count();

    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const ordenesHoy = await prisma.ordenCompra.count({
      where: {
        createdAt: {
          gte: inicioHoy,
        },
      },
    });

    const inicioMes = new Date(
      inicioHoy.getFullYear(),
      inicioHoy.getMonth(),
      1,
    );

    const revenueData = await prisma.ordenCompra.aggregate({
      where: {
        createdAt: {
          gte: inicioMes,
        },
        estado: {
          not: "Cancelado",
        },
      },
      _sum: {
        total: true,
      },
    });

    const ingresosMes = revenueData._sum.total || 0;

    return NextResponse.json([
      {
        usuariosTotales,
        ordenesHoy,
        ingresosMes,
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
