"use server";
import { auth } from "@clerk/nextjs/server";

export async function obtenerHistorialEnvioReal(trackingId: string) {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const shippingBaseUrl =
      process.env.SHIPPING_API_URL ||
      "https://proyecto-c-shipping2-perfume-libre.vercel.app/api";

    const response = await fetch(`${shippingBaseUrl}/shipping/${trackingId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Error API Shipping: ${response.status}`);
    }

    const data = await response.json();

    const estadoReal = data.estado_actual;

    return estadoReal;
  } catch (error) {
    console.error(
      `⚠️ Error al consultar Shipping App para ${trackingId}, usando fallback:`,
      error,
    );
  }
}
