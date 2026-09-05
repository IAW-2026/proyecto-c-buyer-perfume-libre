export interface ResenaExterna {
  id: string;
  productoId: string;
  rating: number;
  comentario: string;
  fecha: string;
}

const COMENTARIOS_GENERICOS = [
  "El perfume huele increíble, dura todo el día. El envío fue súper rápido.",
  "Llegó bien, empaque cuidado. La fragancia es rica pero no dura tanto en mi piel.",
  "Todo perfecto, vendedor muy amable. El producto es 100% original.",
  "Tardaron un poco en despachar, pero el perfume llegó sano y es espectacular.",
  "Muy buena relación calidad-precio. El vendedor contestó al toque.",
  "La caja vino un poco abollada por el correo, pero el frasco intacto. Huele riquísimo.",
  "Excelente atención del vendedor, me asesoró re bien. El perfume es un clásico.",
];

export async function obtenerResenasDelProducto(
  productoId: string,
): Promise<ResenaExterna[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const cantidadResenas = Math.floor(Math.random() * 6) + 5;

  const resenas: ResenaExterna[] = [];

  for (let i = 0; i < cantidadResenas; i++) {
    resenas.push({
      id: `res-${productoId}-${i}`,
      productoId: productoId,
      rating: Math.floor(Math.random() * 2) + 4,
      comentario: COMENTARIOS_GENERICOS[i % COMENTARIOS_GENERICOS.length],
      fecha: new Date().toISOString(),
    });
  }

  return resenas;
}
