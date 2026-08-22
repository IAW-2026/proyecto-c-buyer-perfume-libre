import {
  aprobarOrden,
  rechazarOrden,
  verDetallesOrden,
} from "@/actions/checkout";
import { obtenerAccessTokenVendedor } from "@/lib/api";
import { centavosAPesos } from "@/lib/utils";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Recibimos el formData que manda el Brick desde el frontend
    const body = await request.json();
    const orden = await verDetallesOrden(body.ordenId);

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    const montoEnPesos = centavosAPesos(orden.total);
    const accessTokenVendedor = await obtenerAccessTokenVendedor(
      orden.vendedorId,
    );

    const client = new MercadoPagoConfig({
      accessToken: accessTokenVendedor,
    });
    const payment = new Payment(client);

    // Creamos el pago
    const response = await payment.create({
      body: {
        transaction_amount: montoEnPesos,
        token: body.token,
        description: body.description || "Compra en marketplace C2C",
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id,
        external_reference: body.ordenId,
        payer: {
          email: body.payer.email,
          identification: body.payer.identification,
        },
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      },
    });

    if (!response || !response.id) {
      throw new Error("Error al crear el pago en Mercado Pago");
    }

    if (response.status === "approved") {
      await aprobarOrden(body.ordenId, response.id?.toString());
    } else if (response.status === "rejected") {
      await rechazarOrden(body.ordenId, response.id?.toString());
    }

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
