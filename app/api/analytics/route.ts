import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const daysParam = searchParams.get("days") || "90";
    const days = parseInt(daysParam, 10);
    
    let dateFilter: any = {};
    if (days > 0) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      dateFilter = { createdAt: { gte: pastDate } };
    }

    const totalUsers = await prisma.usuario.count({
      where: dateFilter
    });
    
    // Solo contamos las ordenes que hayan pasado de pendiente y no esten canceladas para el total
    const validStates = ["Pagado", "En proceso", "Enviado", "Entregado"];
    
    const orders = await prisma.ordenCompra.findMany({
      where: {
        estado: {
          in: validStates
        },
        ...dateFilter
      },
      select: {
        id: true,
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const canceledOrdersCount = await prisma.ordenCompra.count({
      where: {
        estado: "Cancelado",
        ...dateFilter
      }
    });

    // Grouping for chart
    const revenueByDate: Record<string, number> = {};
    let totalRevenue = 0;

    orders.forEach(order => {
      totalRevenue += order.total;
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[dateStr]) revenueByDate[dateStr] = 0;
      revenueByDate[dateStr] += order.total;
    });

    const chartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
    }));

    return NextResponse.json({
      totalUsers,
      totalOrders: orders.length + canceledOrdersCount,
      completedOrders: orders.length,
      canceledOrders: canceledOrdersCount,
      totalRevenue,
      chartData
    });
  } catch (error) {
    console.error("Error en analytics API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
