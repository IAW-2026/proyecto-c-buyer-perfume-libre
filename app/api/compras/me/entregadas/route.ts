import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchProductoDesdeSeller, validateApiKey } from "@/lib/api";

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
        estado: {
          in: ["Entregado", "ENTREGADO"],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const usarApiReal = process.env.USE_REAL_API === "true";

    const respuestaFinal = await Promise.all(
      ordenesEntregadas.map(async (orden) => {
        const itemsProcesados = await Promise.all(
          orden.items.map(async (item) => {
            if (usarApiReal) {
              try {
                const prodSeller = await fetchProductoDesdeSeller(
                  item.productoId,
                );
                return {
                  id_producto: item.productoId,
                  nombre_producto:
                    prodSeller.producto.titulo || "Perfume Premium",
                  imagen:
                    prodSeller.producto.imagen || "/placeholder-perfume.jpg",
                };
              } catch (errSeller) {
                console.warn(
                  `[API Entregadas] Error trayendo producto ${item.productoId} de Seller, usando mock:`,
                  errSeller,
                );
              }
            }

            return {
              id_producto: item.productoId,
              nombre_producto: `Perfume Mock ID: ${item.productoId}`,
              imagen:
                "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80",
            };
          }),
        );

        const idVendedorSimulado = `user_3EXlfKfNj061hH7lOCEhs7Wg7qy`;
        const nombreVendedorSimulado = `Vendedor Simulado`;

        return {
          id_orden: orden.id,
          id_comprador: orden.usuarioId,
          id_vendedor: idVendedorSimulado,
          nombre_vendedor: nombreVendedorSimulado,
          fecha_compra: orden.createdAt.toISOString(),
          items: itemsProcesados,
        };
      }),
    );

    return NextResponse.json(respuestaFinal, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/compras/me/entregadas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
