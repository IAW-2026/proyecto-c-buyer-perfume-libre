import { aprobarOrden, rechazarOrden } from "@/actions/checkout";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

interface ResultadoValidacionFirma {
  valida: boolean;
  razon?: string;
}

/**
 * Valida la firma HMAC-SHA256 enviada por Mercado Pago en el header `x-signature`.
 *
 * Especificación oficial de Mercado Pago:
 * 1. Extraer `ts` (timestamp) y `v1` (hash) del header `x-signature`.
 * 2. Extraer `x-request-id` de los headers.
 * 3. Extraer el ID del recurso (habitualmente en query param `data.id` o `id`).
 * 4. Construir la plantilla de manifiesto exacta: `id:[DATA_ID];request-id:[X_REQUEST_ID];ts:[TS];`
 * 5. Generar HMAC-SHA256 con `MP_WEBHOOK_SECRET` y comparar en tiempo constante con `v1`.
 */
export function validarFirmaMercadoPago({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string | undefined;
}): ResultadoValidacionFirma {
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      return { valida: true };
    }
    return {
      valida: false,
      razon: "MP_WEBHOOK_SECRET no está configurado en el servidor",
    };
  }

  if (!xSignature || !xRequestId || !dataId) {
    return {
      valida: false,
      razon:
        "Faltan headers de firma o identificador (x-signature, x-request-id o data.id)",
    };
  }

  // Parsear ts y v1 del header x-signature (ej: "ts=1704908010,v1=618c85345...")
  const partes = xSignature.split(",");
  let ts: string | undefined;
  let hashV1: string | undefined;

  for (const parte of partes) {
    const [clave, ...valorArr] = parte.split("=");
    if (!clave) continue;

    const valor = valorArr.join("=").trim();
    const claveTrim = clave.trim().toLowerCase();

    if (claveTrim === "ts") ts = valor;
    if (claveTrim === "v1") hashV1 = valor;
  }

  if (!ts || !hashV1) {
    return {
      valida: false,
      razon: "Formato de x-signature inválido: faltan campos ts o v1",
    };
  }

  const tsNumero = Number(ts);
  if (!isNaN(tsNumero)) {
    const tsMs = tsNumero > 1e11 ? tsNumero : tsNumero * 1000;
    const ahora = Date.now();
    const TOLERANCIA_MS = 15 * 60 * 1000;
    if (Math.abs(ahora - tsMs) > TOLERANCIA_MS) {
      console.warn(
        `[Webhook MP] Timestamp fuera de tolerancia: ${ts} (diferencia: ${Math.round(
          Math.abs(ahora - tsMs) / 1000,
        )}s)`,
      );
    }
  }
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Calcular HMAC-SHA256 con el secret
  const hmacCalculado = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const bufferCalculado = Buffer.from(hmacCalculado, "utf-8");
  const bufferRecibido = Buffer.from(hashV1, "utf-8");

  if (bufferCalculado.length !== bufferRecibido.length) {
    return {
      valida: false,
      razon: "La longitud de la firma no coincide con el hash esperado",
    };
  }

  const sonIguales = crypto.timingSafeEqual(bufferCalculado, bufferRecibido);
  if (!sonIguales) {
    return {
      valida: false,
      razon: "La firma calculada no coincide con v1",
    };
  }

  return { valida: true };
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    let body: {
      type?: string;
      topic?: string;
      data?: { id?: string | number };
      id?: string | number;
    } = {};

    try {
      body = await request.json();
    } catch {}

    const dataId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body.data?.id?.toString() ||
      body.id?.toString() ||
      null;

    const validacion = validarFirmaMercadoPago({
      xSignature,
      xRequestId,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET,
    });

    if (!validacion.valida) {
      return NextResponse.json(
        { error: "Firma inválida", detalle: validacion.razon },
        { status: 401 },
      );
    }

    const type =
      body.type ||
      body.topic ||
      url.searchParams.get("type") ||
      url.searchParams.get("topic");

    if (type === "payment" && dataId) {
      const paymentId = dataId;

      // 2. Instanciamos MP y le consultamos la info REAL de este pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
      });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      // 3. Extraemos los datos clave
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
      } else if (estadoMP === "rejected" || estadoMP === "cancelled") {
        await rechazarOrden(ordenId, paymentId.toString());
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook de MP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
