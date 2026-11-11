export interface OpcionEnvio {
  operador: string;
  tipo_servicio: string;
  precio: number;
  demora_dias: number;
}

export async function obtenerCotizacionesEnvioMock(): Promise<OpcionEnvio[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      operador: "Correo Argentino",
      tipo_servicio: "Clásico",
      precio: 3500,
      demora_dias: 5,
    },
    {
      operador: "Andreani",
      tipo_servicio: "Rapido",
      precio: 7800,
      demora_dias: 1,
    },
    {
      operador: "OCA",
      tipo_servicio: "Express",
      precio: 5000,
      demora_dias: 3,
    },
    {
      operador: "DHL",
      tipo_servicio: "Internacional",
      precio: 12000,
      demora_dias: 2,
    },
  ];
}

export async function obtenerHistorialSimulado(estado: string) {
  const fechaBase = new Date();

  const haceHoras = (horas: number) => {
    const d = new Date(fechaBase);
    d.setHours(d.getHours() - horas);
    return d.toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const estadoNormalizado = estado?.toUpperCase() || "PENDIENTE";

  switch (estadoNormalizado) {
    case "PENDIENTE":
      return {
        estadoActual: "PENDIENTE",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion:
              "Orden creada. A la espera de confirmación de pago del gateway.",
          },
        ],
      };

    case "PAGADO":
      return {
        estadoActual: "PAGADO",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion:
              "Pago aprobado. Notificando al vendedor para su preparación.",
          },
          {
            fecha: haceHoras(2),
            ubicacion:
              "Orden creada. A la espera de confirmación de pago del gateway.",
          },
        ],
      };

    case "PREPARANDO":
      return {
        estadoActual: "PREPARANDO",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "El vendedor está empacando tu pedido.",
          },
          {
            fecha: haceHoras(12),
            ubicacion:
              "Pago aprobado. Notificando al vendedor para su preparación.",
          },
          {
            fecha: haceHoras(13),
            ubicacion:
              "Orden creada. A la espera de confirmación de pago del gateway.",
          },
        ],
      };

    case "EN_TRANSITO":
      return {
        estadoActual: "EN_TRANSITO",
        historial: [
          {
            fecha: haceHoras(2),
            ubicacion:
              "El paquete está en viaje hacia tu domicilio (Centro de Distribución Regional).",
          },
          {
            fecha: haceHoras(14),
            ubicacion:
              "El operador logístico retiró el paquete del domicilio del vendedor.",
          },
          {
            fecha: haceHoras(28),
            ubicacion: "El vendedor terminó de empacar tu pedido.",
          },
          {
            fecha: haceHoras(40),
            ubicacion:
              "Pago aprobado. Notificando al vendedor para su preparación.",
          },
        ],
      };

    case "ENTREGADO":
      return {
        estadoActual: "ENTREGADO",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion: "Paquete entregado exitosamente al comprador.",
          },
          {
            fecha: haceHoras(18),
            ubicacion:
              "El paquete está en viaje hacia tu domicilio (Centro de Distribución Regional).",
          },
          {
            fecha: haceHoras(42),
            ubicacion:
              "El operador logístico retiró el paquete del domicilio del vendedor.",
          },
          {
            fecha: haceHoras(48),
            ubicacion:
              "Pago aprobado. Notificando al vendedor para su preparación.",
          },
        ],
      };

    case "CANCELADO":
      return {
        estadoActual: "CANCELADO",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion:
              "La orden ha sido cancelada. Si habías pagado, se inició el proceso de reembolso.",
          },
          {
            fecha: haceHoras(24),
            ubicacion:
              "Orden creada. A la espera de confirmación de pago del gateway.",
          },
        ],
      };

    default:
      return {
        estadoActual: "CANCELADO",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion: "Esperando actualización del sistema...",
          },
        ],
      };
  }
}
