import { aprobarOrden, rechazarOrden } from "@/actions/checkout";
import { EstadosOrden } from "@/schema/perfume.schema";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "payment" || body.topic === "payment") {
      const paymentId = body.data.id;

      // 1. Instanciamos MP y le consultamos la info REAL de este pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
      });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      // 2. Extraemos los datos clave
      const estadoMP = paymentInfo.status;
      const ordenId = paymentInfo.external_reference;

      if (!ordenId) {
        return NextResponse.json(
          { error: "Pago sin orden asociada" },
          { status: 400 },
        );
      }

      if (estadoMP === "approved") {
        await aprobarOrden(ordenId, paymentId.toString());
      }
      if (estadoMP === "rejected" || estadoMP === "cancelled") {
        await rechazarOrden(ordenId, paymentId.toString());
      }
    }

    // A Mercado Pago siempre hay que clavarle un 200 OK rápido, sino te sigue insistiendo
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook de MP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
