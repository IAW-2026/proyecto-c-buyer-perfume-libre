import { actualizarEstadoEnvio } from "@/actions/checkout";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tracking_id, estado, fecha } = body;

    // validarToken(headers); (en la def no estaba header asiq lo respetamos por ahora)

    if (!tracking_id || !estado) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }

    await actualizarEstadoEnvio(tracking_id, estado, fecha);

    return NextResponse.json(
      { success: true, mensaje: "Estado actualizado" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "No se encontró ninguna orden con ese tracking_id" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
