import { prisma } from "@/lib/prisma";
import { EstadosOrden } from "@/schema/perfume.schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("No autorizado", { status: 401 });
  }

  try {
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

    // TODO: Si hubiera que hacer algo más con las órdenes canceladas, se podría agregar aquí.
    // ej devolver stock, notificar al usuario, etc.

    return NextResponse.json({
      success: true,
      mensaje: `Se limpiaron ${resultado.count} órdenes fantasmas.`,
    });
  } catch (error) {
    console.error("Error limpiando órdenes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
