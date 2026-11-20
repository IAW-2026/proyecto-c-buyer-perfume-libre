import {
  aprobarOrden,
  rechazarOrden,
  verificarOrdenParaPago,
} from "@/actions/checkout";
import { obtenerAccessTokenVendedor } from "@/lib/api";
import { centavosAPesos } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { z } from "zod";

// Medios de pago que no requieren token de tarjeta (efectivo, tickets, billetera digital, etc.)
const MEDIOS_SIN_TOKEN = new Set([
  "rapipago",
  "pagofacil",
  "cobro_express",
  "bapro_pagos",
  "redlink",
  "ticket",
  "account_money",
  "mercadopago",
  "pix",
  "oxxo",
  "bolbradesco",
]);

function generarClaveIdempotencia(ordenId: string, intentoId: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${ordenId}:${intentoId}`)
    .digest("hex");
  // Formato UUID estándar RFC 4122 v4
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function obtenerNotificationUrl(): string | undefined {
  const candidate =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!candidate) return undefined;

  try {
    const parsed = new URL(candidate);
    // Mercado Pago rechaza localhost y 127.0.0.1 (error 4020). Solo se envía si es un host público.
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".local")
    ) {
      return undefined;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return `${candidate.replace(/\/+$/, "")}/api/webhooks/mercadopago`;
  } catch {
    return undefined;
  }
}

const processPaymentSchema = z
  .object({
    ordenId: z.string().min(1, "El ID de la orden es requerido"),
    token: z.string().optional(),
    payment_method_id: z.string().min(1, "El método de pago es requerido"),
    installments: z.coerce
      .number()
      .int()
      .positive("Las cuotas deben ser un número positivo")
      .optional()
      .default(1),
    issuer_id: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val != null && !isNaN(Number(val)) ? Number(val) : undefined,
      ),
    payer: z.object({
      email: z.string().email("Email inválido"),
      identification: z
        .object({
          type: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
    }),
    idempotencyKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const metodoSinToken = MEDIOS_SIN_TOKEN.has(
      data.payment_method_id.toLowerCase(),
    );
    if (!metodoSinToken && (!data.token || data.token.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["token"],
        message:
          "El token de tarjeta es obligatorio para pagos con tarjeta de crédito o débito",
      });
    }
  });

export async function POST(request: Request) {
  try {
    // 1. Exigir sesión autenticada (401 si no hay usuario)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Validar body con Zod
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de solicitud JSON inválido" },
        { status: 400 },
      );
    }

    const validation = processPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de pago inválidos",
          detalles: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      ordenId,
      token,
      payment_method_id,
      installments,
      issuer_id,
      payer,
      idempotencyKey: keyCliente,
    } = validation.data;

    // 3. Buscar orden y verificar pertenencia y estado pendiente (401/403/404/400/409 diferenciados)
    const verif = await verificarOrdenParaPago(ordenId, userId);
    if (!verif.success) {
      // Si la orden ya fue aprobada y pagada (reintento del cliente ante timeout de red previo),
      // responder de manera idempotente devolviendo el ID de pago ya registrado para redirigir exitosamente.
      if (verif.status === 409 && verif.orden?.pagoId) {
        return NextResponse.json({
          id: verif.orden.pagoId,
          status: "approved",
          status_detail: "already_approved",
        });
      }

      return NextResponse.json(
        { error: verif.error },
        { status: verif.status },
      );
    }

    const orden = verif.orden;

    // 4. Calcular importe, descripción y referencia exclusivamente desde la base de datos
    const montoEnPesos = centavosAPesos(orden.total);
    if (!montoEnPesos || montoEnPesos <= 0) {
      return NextResponse.json(
        { error: "El monto a cobrar debe ser mayor a 0" },
        { status: 400 },
      );
    }

    const descripcion = `Compra en Perfume Libre - Orden #${orden.id}`;
    const referenciaExterna = orden.id;

    const accessTokenVendedor = await obtenerAccessTokenVendedor(
      orden.vendedorId,
    );
    if (
      !accessTokenVendedor ||
      typeof accessTokenVendedor !== "string" ||
      accessTokenVendedor.trim() === ""
    ) {
      return NextResponse.json(
        { error: "No se pudieron obtener las credenciales de pago del vendedor" },
        { status: 502 },
      );
    }

    const client = new MercadoPagoConfig({
      accessToken: accessTokenVendedor,
    });
    const payment = new Payment(client);

    const notification_url = obtenerNotificationUrl();

    // 5. Clave de idempotencia estable vinculada a la orden y al intento de pago
    const claveIdempotencia =
      keyCliente ||
      generarClaveIdempotencia(
        orden.id,
        token && token.trim() !== "" ? token.trim() : payment_method_id,
      );

    // 6. Crear el pago en Mercado Pago
    const response = await payment.create({
      body: {
        transaction_amount: montoEnPesos,
        ...(notification_url ? { notification_url } : {}),
        token,
        description: descripcion,
        installments,
        payment_method_id,
        issuer_id,
        external_reference: referenciaExterna,
        payer: {
          email: payer.email,
          identification: payer.identification,
        },
      },
      requestOptions: {
        idempotencyKey: claveIdempotencia,
      },
    });

    if (!response || !response.id) {
      throw new Error("Error al crear el pago en Mercado Pago");
    }

    if (response.status === "approved") {
      const resAprob = await aprobarOrden(orden.id, response.id.toString());
      if (!resAprob.success) {
        console.error(
          `[process-payment] Error al aprobar la orden ${orden.id}:`,
          resAprob.error,
        );
      }
    } else if (response.status === "rejected") {
      const resRech = await rechazarOrden(orden.id, response.id.toString());
      if (!resRech.success) {
        console.error(
          `[process-payment] Error al rechazar la orden ${orden.id}:`,
          resRech.error,
        );
      }
    }

    // 7. Devolver la respuesta de Mercado Pago al frontend
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
