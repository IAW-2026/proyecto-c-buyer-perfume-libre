import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { mockPerfumes } from "@/lib/mockPerfumes";
import { prisma } from "@/lib/prisma";
import { Perfume } from "@/schema/perfume.schema";
import { faker } from "@faker-js/faker/locale/es";

// Configuración de operadores logísticos y servicios
interface OperadorConfig {
  operador: string;
  servicios: { tipo: string; precioBase: number }[];
}

const OPERADORES_LOGISTICA: OperadorConfig[] = [
  {
    operador: "Correo Argentino",
    servicios: [
      { tipo: "Clásico", precioBase: 3500 },
      { tipo: "Express", precioBase: 5200 },
    ],
  },
  {
    operador: "Andreani",
    servicios: [
      { tipo: "Estándar", precioBase: 4800 },
      { tipo: "Rápido", precioBase: 7800 },
    ],
  },
  {
    operador: "OCA",
    servicios: [
      { tipo: "Estándar", precioBase: 4200 },
      { tipo: "Express", precioBase: 6500 },
    ],
  },
  {
    operador: "DHL",
    servicios: [
      { tipo: "Prioritario", precioBase: 9500 },
      { tipo: "Express", precioBase: 12000 },
    ],
  },
];

/**
 * Ponderación mensual de los últimos 12 meses para reflejar la estacionalidad de perfumería:
 * - Navidad / Fiestas (Diciembre): PICO MÁXIMO
 * - Día de la Madre (Octubre): PICO MUY ALTO
 * - Día del Padre (Junio): PICO ALTO
 * - Hot Sale (Mayo) y Cyber/Black Friday (Noviembre): PICOS MEDIOS
 */
const ESTACIONALIDAD_MESES = [
  { mesOffset: 11, weight: 28, nombre: "Navidad / Fiestas (Dic)" },
  { mesOffset: 10, weight: 6, nombre: "Valle pos-fiestas (Ene)" },
  { mesOffset: 9, weight: 11, nombre: "San Valentín (Feb)" },
  { mesOffset: 8, weight: 8, nombre: "Comienzo de año (Mar)" },
  { mesOffset: 7, weight: 8, nombre: "Otoño (Abr)" },
  { mesOffset: 6, weight: 16, nombre: "Hot Sale (May)" },
  { mesOffset: 5, weight: 20, nombre: "Día del Padre (Jun)" },
  { mesOffset: 4, weight: 9, nombre: "Invierno (Jul)" },
  { mesOffset: 3, weight: 10, nombre: "Invierno (Ago)" },
  { mesOffset: 2, weight: 12, nombre: "Primavera (Sep)" },
  { mesOffset: 1, weight: 26, nombre: "Día de la Madre (Oct)" },
  { mesOffset: 0, weight: 18, nombre: "Black Friday / Cyber en curso (Nov)" },
];

/**
 * Genera una fecha con estacionalidad de compra posterior a la fecha mínima dada.
 */
function generarFechaEstacional(fechaMinima: Date): Date {
  const ahora = new Date();
  let intentos = 0;

  while (intentos < 30) {
    intentos++;
    const mesElegido = faker.helpers.weightedArrayElement(
      ESTACIONALIDAD_MESES.map((m) => ({ weight: m.weight, value: m.mesOffset })),
    );

    let fechaTentativa: Date;

    if (mesElegido === 0) {
      // Mes actual: desde el día 1 hasta ahora
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
      const desde = inicioMes > fechaMinima ? inicioMes : fechaMinima;
      if (desde >= ahora) {
        fechaTentativa = new Date(ahora.getTime() - faker.number.int({ min: 60, max: 3600 }) * 1000);
      } else {
        fechaTentativa = faker.date.between({ from: desde, to: ahora });
      }
    } else {
      const ref = new Date(ahora.getFullYear(), ahora.getMonth() - mesElegido, 1);
      const anio = ref.getFullYear();
      const mes = ref.getMonth();
      const inicioMes = new Date(anio, mes, 1, 0, 0, 0);
      const finMes = new Date(anio, mes + 1, 0, 23, 59, 59);

      if (finMes <= fechaMinima) {
        continue;
      }
      const desde = inicioMes > fechaMinima ? inicioMes : fechaMinima;
      fechaTentativa = faker.date.between({ from: desde, to: finMes });
    }

    if (fechaTentativa >= fechaMinima && fechaTentativa <= ahora) {
      return fechaTentativa;
    }
  }

  // Fallback si no encuentra ventana: fecha aleatoria entre fechaMinima y hoy
  if (fechaMinima < ahora) {
    return faker.date.between({ from: fechaMinima, to: ahora });
  }
  return ahora;
}

/**
 * Calcula costo y demora según el operador y la provincia de destino.
 */
function cotizarEnvioPorProvincia(provincia: string) {
  const operadorConfig = faker.helpers.arrayElement(OPERADORES_LOGISTICA);
  const servicio = faker.helpers.arrayElement(operadorConfig.servicios);

  let demoraBase = 2;
  let factorPrecio = 1.0;

  if (provincia.includes("Buenos Aires") || provincia.includes("CABA")) {
    demoraBase = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 1 : 2;
    factorPrecio = 1.0;
  } else if (provincia === "Córdoba" || provincia === "Santa Fe") {
    demoraBase = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 2 : 3;
    factorPrecio = 1.1;
  } else {
    // Provincias más alejadas (Mendoza, Tucumán, Neuquén, Salta, etc.)
    demoraBase = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 3 : 5;
    factorPrecio = 1.25;
  }

  const precioFinalPesos = Math.round(servicio.precioBase * factorPrecio);

  return {
    operador: operadorConfig.operador,
    servicio: servicio.tipo,
    demoraDias: demoraBase,
    costoEnvioCentavos: precioFinalPesos * 100, // En centavos
  };
}

export async function seedOrdenesEItems() {
  console.log("🛍️ [03-ordenes-e-items] Generando órdenes e ítems con coherencia total...");

  // 1. Cargar usuarios de prueba y sus direcciones
  const usuarios = await prisma.usuario.findMany({
    where: { id: { startsWith: "user_seed_" } },
    include: { direcciones: true },
    orderBy: { createdAt: "asc" },
  });

  if (usuarios.length === 0) {
    throw new Error("No hay usuarios seed creados. Ejecuta primero 01-usuarios.ts");
  }

  // 2. Agrupar productos de catálogo por vendedor para cumplir "Un vendedor por orden"
  const perfumesPorVendedor: Record<string, Perfume[]> = {};
  for (const perfume of mockPerfumes) {
    const vendedor = perfume.vendedor;
    if (!perfumesPorVendedor[vendedor]) {
      perfumesPorVendedor[vendedor] = [];
    }
    perfumesPorVendedor[vendedor].push(perfume);
  }
  const vendedoresDisponibles = Object.keys(perfumesPorVendedor);

  // 3. Seleccionar compradores: solo entre 35% y 50% de los usuarios llegará a comprar (~42%)
  const porcentajeCompradores = 0.42;
  const cantCompradores = Math.floor(usuarios.length * porcentajeCompradores);
  const usuariosCompradores = faker.helpers.arrayElements(usuarios, cantCompradores);

  console.log(` • Compradores seleccionados: ${usuariosCompradores.length} de ${usuarios.length} usuarios (${(porcentajeCompradores * 100).toFixed(0)}%).`);

  const ahora = new Date();
  let totalOrdenesCreadas = 0;
  const estadisticasEstados: Record<string, number> = {};
  const estadisticasOperadores: Record<string, number> = {};
  let totalMontoCentavos = 0;

  // 4. Generar compras por comprador respetando la recurrencia:
  // ~60% 1 orden, ~25% 2 órdenes, ~15% 3 o más órdenes
  for (const usuario of usuariosCompradores) {
    if (!usuario.direcciones || usuario.direcciones.length === 0) {
      continue;
    }

    const recurrenciaRandom = Math.random();
    let cantCompras = 1;
    if (recurrenciaRandom > 0.85) {
      cantCompras = faker.number.int({ min: 3, max: 5 }); // 15% hace 3 a 5 órdenes
    } else if (recurrenciaRandom > 0.6) {
      cantCompras = 2; // 25% hace 2 órdenes
    } // 60% hace 1 orden

    let fechaAnterior = usuario.createdAt;

    for (let o = 0; o < cantCompras; o++) {
      // Elegir dirección del usuario
      const direccion = faker.helpers.arrayElement(usuario.direcciones);

      // Fecha de compra estacional y posterior a la anterior
      const fechaCompra = generarFechaEstacional(fechaAnterior);
      fechaAnterior = new Date(fechaCompra.getTime() + faker.number.int({ min: 14, max: 60 }) * 86400000);

      // Cotizar envío según provincia y operador
      const envio = cotizarEnvioPorProvincia(direccion.provincia);

      // Elegir un vendedor y seleccionar entre 1 y 4 ítems SOLO de ese vendedor
      const vendedorElegido = faker.helpers.arrayElement(vendedoresDisponibles);
      const catalogoVendedor = perfumesPorVendedor[vendedorElegido];

      const maxItems = Math.min(4, catalogoVendedor.length);
      const cantItems = faker.number.int({ min: 1, max: maxItems });
      const perfumesElegidos = faker.helpers.arrayElements(catalogoVendedor, cantItems);

      let sumaItemsCentavos = 0;
      const itemsData = perfumesElegidos.map((prod) => {
        // Cantidades: 80% compra 1, 15% compra 2, 5% compra 3
        const cantidad = faker.helpers.weightedArrayElement([
          { weight: 80, value: 1 },
          { weight: 15, value: 2 },
          { weight: 5, value: 3 },
        ]);
        const precioUnitario = prod.precio; // Ya está en centavos
        sumaItemsCentavos += precioUnitario * cantidad;

        return {
          productoId: String(prod.id),
          precio: precioUnitario,
          cantidad: cantidad,
        };
      });

      // Regla de Buyer App: total = suma(items) + costoEnvio
      const totalOrdenCentavos = sumaItemsCentavos + envio.costoEnvioCentavos;

      // Determinar Estado según antigüedad de la orden
      const diasAtras = (ahora.getTime() - fechaCompra.getTime()) / 86400000;
      let estado: EstadoOrden;

      if (diasAtras > 14) {
        // Órdenes viejas: 93% ENTREGADO, 7% CANCELADO
        estado = Math.random() < 0.07 ? EstadoOrden.CANCELADO : EstadoOrden.ENTREGADO;
      } else if (diasAtras <= 2) {
        // Órdenes muy recientes (últimas 48hs)
        estado = faker.helpers.weightedArrayElement([
          { weight: 35, value: EstadoOrden.PENDIENTE },
          { weight: 55, value: EstadoOrden.PAGADO },
          { weight: 10, value: EstadoOrden.CANCELADO },
        ]);
      } else if (diasAtras <= 6) {
        // Órdenes de 3 a 6 días
        estado = faker.helpers.weightedArrayElement([
          { weight: 45, value: EstadoOrden.PREPARANDO },
          { weight: 45, value: EstadoOrden.EN_TRANSITO },
          { weight: 10, value: EstadoOrden.CANCELADO },
        ]);
      } else {
        // Órdenes de 7 a 14 días
        estado = faker.helpers.weightedArrayElement([
          { weight: 25, value: EstadoOrden.EN_TRANSITO },
          { weight: 70, value: EstadoOrden.ENTREGADO },
          { weight: 5, value: EstadoOrden.CANCELADO },
        ]);
      }

      // Coherencia de Ids externos:
      // pagoId solo desde PAGADO en adelante
      // envioId solo cuando ya hay despacho/guía emitida
      let pagoId: string | null = null;
      let envioId: string | null = null;

      if (estado !== EstadoOrden.PENDIENTE) {
        if (estado === EstadoOrden.CANCELADO) {
          // Si canceló, un 50% llegó a pagar y fue reembolsada
          pagoId = Math.random() < 0.5 ? `pago_seed_${faker.string.alphanumeric(14)}` : null;
        } else {
          pagoId = `pago_seed_${faker.string.alphanumeric(14)}`;
        }
      }

      if (estado === EstadoOrden.EN_TRANSITO || estado === EstadoOrden.ENTREGADO) {
        envioId = `TRK_SEED_${faker.string.alphanumeric(10).toUpperCase()}`;
      } else if (estado === EstadoOrden.PREPARANDO) {
        // Algunas preparando ya tienen etiqueta/tracking generado
        envioId = Math.random() < 0.6 ? `TRK_SEED_${faker.string.alphanumeric(10).toUpperCase()}` : null;
      }

      // Fecha updatedAt coherente con el ciclo de entrega
      let updatedAt = fechaCompra;
      if (estado === EstadoOrden.ENTREGADO) {
        // En órdenes entregadas, el ciclo de entrega real es aprox createdAt + demoraDias (+/- jitter)
        const variacionDias = faker.helpers.arrayElement([-1, 0, 0, 1, 2]);
        const diasReales = Math.max(1, envio.demoraDias + variacionDias);
        const horasExtra = faker.number.int({ min: 2, max: 10 });
        const tiempoEntregaMs = (diasReales * 24 + horasExtra) * 3600000;
        updatedAt = new Date(Math.min(ahora.getTime(), fechaCompra.getTime() + tiempoEntregaMs));
      } else if (estado === EstadoOrden.CANCELADO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 1, max: 24 }) * 3600000);
      } else if (estado === EstadoOrden.EN_TRANSITO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 24, max: 48 }) * 3600000);
      } else if (estado === EstadoOrden.PREPARANDO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 6, max: 24 }) * 3600000);
      } else if (estado === EstadoOrden.PAGADO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 15, max: 120 }) * 60000);
      }

      if (updatedAt > ahora) {
        updatedAt = ahora;
      }

      // Crear Orden y sus Items en la base de datos
      await prisma.ordenCompra.create({
        data: {
          usuarioId: usuario.id,
          vendedorId: vendedorElegido,
          pagoId,
          envioId,
          estado,
          total: totalOrdenCentavos,
          createdAt: fechaCompra,
          updatedAt,
          direccionId: direccion.id,
          costoEnvio: envio.costoEnvioCentavos,
          operadorEnvio: envio.operador,
          servicioEnvio: envio.servicio,
          demoraDias: envio.demoraDias,
          items: {
            create: itemsData,
          },
        },
      });

      totalOrdenesCreadas++;
      totalMontoCentavos += totalOrdenCentavos;
      estadisticasEstados[estado] = (estadisticasEstados[estado] || 0) + 1;
      estadisticasOperadores[envio.operador] = (estadisticasOperadores[envio.operador] || 0) + 1;
    }
  }

  const compradoresRecurrentes = usuariosCompradores.length; // Compradores con al menos 1
  const ticketPromedioPesos = Math.round(totalMontoCentavos / totalOrdenesCreadas / 100);

  console.log(`✅ [03-ordenes-e-items] ${totalOrdenesCreadas} órdenes creadas exitosamente.`);
  console.log(` • Ticket promedio: $${ticketPromedioPesos.toLocaleString("es-AR")}`);
  console.log(" • Distribución por estado:");
  for (const [est, cant] of Object.entries(estadisticasEstados)) {
    const pct = ((cant / totalOrdenesCreadas) * 100).toFixed(1);
    console.log(`   - ${est}: ${cant} (${pct}%)`);
  }
  console.log(" • Distribución por operador logístico:");
  for (const [op, cant] of Object.entries(estadisticasOperadores)) {
    const pct = ((cant / totalOrdenesCreadas) * 100).toFixed(1);
    console.log(`   - ${op}: ${cant} (${pct}%)`);
  }
  console.log("");
}

if (process.argv[1]?.includes("03-ordenes-e-items")) {
  seedOrdenesEItems()
    .catch((e) => {
      console.error("❌ Error en 03-ordenes-e-items:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
