import { obtenerItemsOrdenParaSeller, obtenerOrden } from "@/actions/checkout";
import { validateApiKey } from "@/lib/api";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, segmentData: Params) {
  try {
    const params = await segmentData.params;
    const ordenId = params.id;

    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!ordenId) {
      return new Response(
        JSON.stringify({ error: "ID de la orden no proporcionado" }),
        { status: 400 },
      );
    }

    const orden = await obtenerItemsOrdenParaSeller(ordenId);

    const itemsFormateados = orden.items.map((item) => ({
      id_producto: item.productoId,
      cantidad: item.cantidad,
    }));

    const responseData = {
      id_comprador: orden.usuarioId,
      items: itemsFormateados,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    if (error.message === "Orden no encontrada") {
      return NextResponse.json(
        { error: "No se encontró ninguna orden con ese ID" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error interno en el servidor: " + error.message },
      { status: 500 },
    );
  }
}
