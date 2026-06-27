// TODO: CAMBIAR
export async function obtenerCotizacionesEnvioMock(): Promise<OpcionEnvio[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      operador: "Correo Argentino",
      tipo_servicio: "Clásico",
      precio: 350000,
      demora_dias: 5,
    },
    {
      operador: "Andreani",
      tipo_servicio: "Rapido",
      precio: 780000,
      demora_dias: 1,
    },
    {
      operador: "OCA",
      tipo_servicio: "Express",
      precio: 500000,
      demora_dias: 3,
    },
    {
      operador: "DHL",
      tipo_servicio: "Internacional",
      precio: 1200000,
      demora_dias: 2,
    },
  ];
}

export interface OpcionEnvio {
  operador: string;
  tipo_servicio: string;
  precio: number;
  demora_dias: number;
}
