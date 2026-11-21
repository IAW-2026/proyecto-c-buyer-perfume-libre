import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSnapshotsProductos, validateApiKey } from "@/lib/api";
import { EstadoOrden } from "@/lib/generated/prisma/enums";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_comprador = searchParams.get("id_comprador");

    if (!validateApiKey(req)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!id_comprador) {
      return NextResponse.json(
        { error: "El parámetro id_comprador es requerido" },
        { status: 400 },
      );
    }

    const ordenesEntregadas = await prisma.ordenCompra.findMany({
      where: {
        usuarioId: id_comprador,
        estado: EstadoOrden.ENTREGADO,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Identificar productos legacy sin snapshot entre todas las órdenes entregadas
    const itemsSinSnapshot = ordenesEntregadas
      .flatMap((orden) => orden.items)
      .filter((item) => !item.nombre || !item.imagenUrl);

    const legacyMap = new Map<string, { titulo: string; imagen: string }>();

    if (itemsSinSnapshot.length > 0) {
      const uniqueLegacyIds = Array.from(
        new Set(itemsSinSnapshot.map((i) => i.productoId)),
      );

      try {
        const snapshots = await obtenerSnapshotsProductos(uniqueLegacyIds);
        for (const [id, snap] of snapshots.entries()) {
          legacyMap.set(id, {
            titulo: snap.nombre,
            imagen: snap.imagenUrl,
          });
        }
      } catch (err) {
        console.warn("[API Entregadas] Error obteniendo snapshots legacy:", err);
      }
    }

    const respuestaFinal = ordenesEntregadas.map((orden) => {
      const itemsProcesados = orden.items.map((item) => {
        const fallback = legacyMap.get(item.productoId);
        return {
          id_producto: item.productoId,
          nombre_producto:
            item.nombre ||
            fallback?.titulo ||
            `Perfume ID: ${item.productoId}`,
          imagen:
            item.imagenUrl ||
            fallback?.imagen ||
            "/placeholder-perfume.jpg",
        };
      });

      return {
        id_orden: orden.id,
        id_comprador: orden.usuarioId,
        id_vendedor: orden.vendedorId || "user_3EXlfKfNj061hH7lOCEhs7Wg7qy",
        nombre_vendedor: orden.items[0]?.vendedor || "Vendedor Oficial",
        fecha_compra: orden.createdAt.toISOString(),
        items: itemsProcesados,
      };
    });

    return NextResponse.json(respuestaFinal, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/compras/me/entregadas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
