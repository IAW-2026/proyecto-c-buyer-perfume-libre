import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Recibimos el formData que manda el Brick desde el frontend
    const body = await request.json();

    // Inicializamos el SDK con tu Access Token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
    const payment = new Payment(client);

    // Creamos el pago
    const response = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: body.description || "Compra en marketplace C2C",
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id,
        payer: {
          email: body.payer.email,
          identification: body.payer.identification,
        },
      },
      requestOptions: {
        // Generamos un ID único por cada intento de pago (Idempotency Key)
        idempotencyKey: crypto.randomUUID(),
      },
    });

    // Devolvemos la respuesta de Mercado Pago al frontend
    return NextResponse.json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
    });
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    return NextResponse.json(
      { error: "Hubo un error procesando el cobro" },
      { status: 500 },
    );
  }
}
