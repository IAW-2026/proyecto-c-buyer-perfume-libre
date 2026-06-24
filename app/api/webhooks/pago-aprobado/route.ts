import {
  actualizarOrden,
  obtenerOrden,
  vaciarCarrito,
} from "@/actions/checkout";
import { generarOrdenEnvio } from "@/lib/api";
import { EstadosOrden } from "@/schema/perfume.schema";
import { NextResponse } from "next/server";

// TODO: Charlar para cambiar el nombre del webhook a algo más genérico,
// tipo "actualizacion-orden" o algo así, porque en realidad no solo se va a usar para pagos aprobados,
// sino también para rechazos.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_orden, id_pago, estado } = body;

    const nuevoEstadoOrden =
      estado === "aprobado"
        ? EstadosOrden.enum.Pagado
        : EstadosOrden.enum.Rechazado;

    const orden = await obtenerOrden(id_orden);

    const id_envio = await generarOrdenEnvio(
      id_orden,
      orden.usuarioId,
      orden.direccionId,
      orden.items,
      orden.servicioEnvio,
    );

    await actualizarOrden(id_orden, id_pago, id_envio, nuevoEstadoOrden);

    return NextResponse.json({ message: "200 ok" });
  } catch (error) {
    return NextResponse.json(
      { error: `Error en el webhook ${error}` },
      { status: 500 },
    );
  }
}

function validarToken(headers: Headers) {
  //TODO: Implementar la lógica para validar el token secreto que esperamos
  // recibir en los headers de la request. (Aun no lo discutimos)
}
