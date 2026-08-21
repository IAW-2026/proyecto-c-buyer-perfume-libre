import { verDetallesOrden } from "@/actions/checkout";
import { centavosAPesos } from "@/lib/utils";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "MP_ACCESS_TOKEN no está definido" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const orden = await verDetallesOrden(body.ordenId);

  if (!orden) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  const montoEnPesos = centavosAPesos(orden.total);

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });
  const preference = new Preference(client);

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: orden.id,
            title: "Producto de prueba C2C",
            quantity: 1,
            unit_price: montoEnPesos,
            currency_id: "ARS",
          },
        ],
        purpose: "wallet_purchase",
      },
    });

    return NextResponse.json({ preferenceId: response.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear la preferencia" },
      { status: 500 },
    );
  }
}
