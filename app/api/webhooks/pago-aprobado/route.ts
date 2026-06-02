import {
  actualizarOrden,
  obtenerOrden,
  vaciarCarrito,
} from "@/actions/checkout";
import { generarOrden } from "@/lib/api";
import { EstadosOrden } from "@/schema/perfume.schema";
import { NextResponse } from "next/server";

// TODO: Charlar para cambiar el nombre del webhook a algo más genérico,
// tipo "actualizacion-orden" o algo así, porque en realidad no solo se va a usar para pagos aprobados,
// sino también para rechazos.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_orden, id_pago, estado } = body;

    // validarToken(headers); (en la def no estaba header asiq lo respetamos por ahora)

    const nuevoEstadoOrden =
      estado === "aprobado"
        ? EstadosOrden.enum.Pagado
        : EstadosOrden.enum.Rechazado;

    const orden = await obtenerOrden(id_orden);

    const id_envio = await generarOrden(
      id_orden,
      orden.usuarioId,
      orden.direccionId,
      orden.items,
      "id_vendedor_mock",
      {
        operador: orden.operadorEnvio,
        tipo_servicio: orden.servicioEnvio,
        precio: orden.costoEnvio,
        demora_en_dias: orden.demoraDias,
      },
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
