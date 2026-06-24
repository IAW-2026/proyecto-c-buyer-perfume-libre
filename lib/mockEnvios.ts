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

  const estadoNormalizado = estado?.toUpperCase() || "DESCONOCIDO";

  switch (estadoNormalizado) {
    case "CREADO":
      return {
        estadoActual: "Registrado",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "Envío registrado. Esperando preparación del vendedor.",
          },
        ],
      };

    case "PREPARANDO":
      return {
        estadoActual: "Preparando",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "El vendedor está empacando tu pedido.",
          },
          {
            fecha: haceHoras(4),
            ubicacion: "Envío registrado. Esperando preparación del vendedor.",
          },
        ],
      };

    case "RETIRADO":
      return {
        estadoActual: "Retirado",
        historial: [
          {
            fecha: haceHoras(1),
            ubicacion: "El operador logístico retiró el paquete del vendedor.",
          },
          {
            fecha: haceHoras(5),
            ubicacion: "El vendedor terminó de empacar tu pedido.",
          },
          {
            fecha: haceHoras(12),
            ubicacion: "Envío registrado. Esperando preparación del vendedor.",
          },
        ],
      };

    case "EN_TRANSITO":
      return {
        estadoActual: "En camino",
        historial: [
          {
            fecha: haceHoras(2),
            ubicacion: "El paquete está en camino a tu domicilio.",
          },
          {
            fecha: haceHoras(14),
            ubicacion: "El paquete llegó al centro de distribución regional.",
          },
          {
            fecha: haceHoras(24),
            ubicacion: "El operador logístico retiró el paquete del vendedor.",
          },
          {
            fecha: haceHoras(28),
            ubicacion: "El vendedor terminó de empacar tu pedido.",
          },
        ],
      };

    case "ENTREGADO":
      return {
        estadoActual: "Entregado",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion: "Paquete entregado al comprador exitosamente.",
          },
          {
            fecha: haceHoras(4),
            ubicacion: "El paquete está en camino a tu domicilio.",
          },
          {
            fecha: haceHoras(24),
            ubicacion: "El paquete llegó al centro de distribución regional.",
          },
          {
            fecha: haceHoras(48),
            ubicacion: "El operador logístico retiró el paquete del vendedor.",
          },
        ],
      };

    case "NO_ENTREGADO":
      return {
        estadoActual: "Intento fallido",
        historial: [
          {
            fecha: haceHoras(0),
            ubicacion:
              "Intento de entrega fallido. Se reprogramará una nueva visita.",
          },
          {
            fecha: haceHoras(4),
            ubicacion: "El paquete está en camino a tu domicilio.",
          },
          {
            fecha: haceHoras(24),
            ubicacion: "El paquete llegó al centro de distribución regional.",
          },
        ],
      };

    case "CANCELADO":
      return {
        estadoActual: "Cancelado",
        historial: [
          { fecha: haceHoras(0), ubicacion: "El envío ha sido cancelado." },
          {
            fecha: haceHoras(24),
            ubicacion: "Envío registrado. Esperando preparación del vendedor.",
          },
        ],
      };

    default:
      return {
        estadoActual: estado || "Desconocido",
        historial: [],
      };
  }
}

export async function obtenerCotizacionesEnvio(
  codigo_postal: string,
  direccion_entrega: string,
): Promise<OpcionEnvio[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      operador: "Correo Argentino",
      tipo_servicio: "Clásico",
      precio: 350000,
      demora_en_dias: 5,
    },
    {
      operador: "Andreani",
      tipo_servicio: "Rapido",
      precio: 780000,
      demora_en_dias: 1,
    },
    {
      operador: "OCA",
      tipo_servicio: "Express",
      precio: 500000,
      demora_en_dias: 3,
    },
    {
      operador: "DHL",
      tipo_servicio: "Internacional",
      precio: 1200000,
      demora_en_dias: 2,
    },
  ];
}

export interface OpcionEnvio {
  operador: string;
  tipo_servicio: string;
  precio: number;
  demora_en_dias: number;
}
