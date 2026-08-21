import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "MP_ACCESS_TOKEN no está definido" },
      { status: 500 },
    );
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });
  const preference = new Preference(client);

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: "item-demo",
            title: "Producto de prueba C2C",
            quantity: 1,
            unit_price: 100,
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
