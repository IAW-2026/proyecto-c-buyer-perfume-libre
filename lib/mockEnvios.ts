// lib/mock-shipping.ts

export async function obtenerHistorialSimulado(estado: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const fechaBase = new Date();

  const haceHoras = (horas: number) => {
    const d = new Date(fechaBase);
    d.setHours(d.getHours() - horas);
    return d.toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  switch (estado) {
    case "Pagado":
      return {
        estadoActual: "En proceso",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "El vendedor está preparando tu paquete.",
          },
          {
            fecha: haceHoras(2),
            ubicacion: "Pago confirmado. Esperando despacho.",
          },
        ],
      };
    case "En proceso":
      return {
        estadoActual: "En proceso",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "El vendedor está preparando tu paquete.",
          },
          {
            fecha: haceHoras(2),
            ubicacion: "Pago confirmado. Esperando despacho.",
          },
        ],
      };
    case "Enviado":
      return {
        estadoActual: "Enviado",
        historial: [
          {
            fecha: haceHoras(0.5),
            ubicacion: "El paquete está en camino a tu domicilio.",
          },
          {
            fecha: haceHoras(4),
            ubicacion: "El paquete llegó al centro de distribución local.",
          },
          {
            fecha: haceHoras(24),
            ubicacion: "El vendedor despachó el paquete.",
          },
        ],
      };

    case "Entregado":
      return {
        estadoActual: "Entregado",
        historial: [
          { fecha: haceHoras(0), ubicacion: "Paquete entregado al comprador." },
          {
            fecha: haceHoras(2),
            ubicacion: "El paquete está en camino a tu domicilio.",
          },
          {
            fecha: haceHoras(24),
            ubicacion: "El paquete llegó al centro de distribución local.",
          },
          {
            fecha: haceHoras(48),
            ubicacion: "El vendedor despachó el paquete.",
          },
        ],
      };

    default:
      return { estadoActual: "Desconocido", historial: [] };
  }
}
