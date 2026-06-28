import { NextResponse } from "next/server";
import { fetchProductoDesdeSeller, validateApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    const direccion = await prisma.direccion.findUnique({
      where: { id: orden.direccionId },
    });

    const promesasItems = orden.items.map(async (item) => {
      try {
        const dataSeller = await fetchProductoDesdeSeller(item.productoId);

        return {
          productoId: item.productoId,
          nombre: dataSeller?.producto?.titulo || `Producto ${item.productoId}`,
          cantidad: item.cantidad,
          precio: item.precio,
          imagenUrl: dataSeller?.producto?.imagen || "/placeholder-perfume.jpg",
        };
      } catch (error) {
        console.warn(
          `Fallback: No se pudo cargar el producto ${item.productoId}:`,
          error,
        );
        return {
          productoId: item.productoId,
          nombre: `Producto no disponible (${item.productoId})`,
          cantidad: item.cantidad,
          precio: item.precio,
          imagenUrl: "/placeholder-perfume.jpg",
        };
      }
    });

    const itemsEnriquecidos = await Promise.all(promesasItems);

    const resultado = [
      {
        id: orden.id,
        compradorId: orden.usuarioId,
        vendedorId: orden.vendedorId,
        fecha: orden.createdAt.toISOString(),
        total: orden.total,
        estadoPago: orden.pagoId ? "Pagado" : "Pendiente",
        estadoEnvio: orden.estado,
        items: itemsEnriquecidos,
        envioInfo: {
          trackingId: orden.envioId || "Pendiente",
          operador: orden.operadorEnvio,
          direccion: direccion
            ? `${direccion.calle} ${direccion.altura}, ${direccion.localidad}, ${direccion.provincia}`
            : "Dirección no encontrada",
          demoraDias: orden.demoraDias,
        },
      },
    ];

    return NextResponse.json(resultado);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
