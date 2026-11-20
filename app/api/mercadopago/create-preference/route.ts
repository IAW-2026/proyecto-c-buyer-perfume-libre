import { verificarOrdenParaPago } from "@/actions/checkout";
import { obtenerAccessTokenVendedor } from "@/lib/api";
import { centavosAPesos, obtenerComision } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPreferenceSchema = z.object({
  ordenId: z.string().min(1, "El ID de la orden es requerido"),
});

export async function POST(request: Request) {
  try {
    // 1. Exigir sesión autenticada (401 si no hay usuario)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN no está definido" },
        { status: 500 },
      );
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

    const validation = createPreferenceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { ordenId } = validation.data;

    // 3. Buscar orden y verificar pertenencia y estado pendiente (401/403/404 diferenciados)
    const verif = await verificarOrdenParaPago(ordenId, userId);
    if (!verif.success) {
      return NextResponse.json({ error: verif.error }, { status: verif.status });
    }

    const orden = verif.orden;

    // 4. Calcular importe, descripción y referencia exclusivamente desde la base de datos
    const montoEnPesos = centavosAPesos(orden.total);
    if (!montoEnPesos || montoEnPesos <= 0) {
      return NextResponse.json(
        { error: "El monto de la orden debe ser mayor a 0" },
        { status: 400 },
      );
    }

    const comision = obtenerComision(montoEnPesos);
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
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: orden.id,
            title: descripcion,
            quantity: 1,
            unit_price: montoEnPesos,
            currency_id: "ARS",
          },
        ],
        purpose: "wallet_purchase",
        marketplace_fee: comision,
        external_reference: referenciaExterna,
      },
    });

    return NextResponse.json({ preferenceId: response.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia" },
      { status: 500 },
    );
  }
}
