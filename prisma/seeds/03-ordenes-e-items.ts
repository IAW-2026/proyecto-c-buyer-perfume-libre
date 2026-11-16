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
 * Ponderación mensual estacional balanceada de los últimos 12 meses:
 * - Dic: Navidad / Fiestas (Pico)
 * - May: Hot Sale
 * - Jun: Día del Padre
 * - Oct: Día de la Madre (Pico)
 * - Nov: Cyber / Black Friday (en curso, proporcional y sin sobreacumulación)
 */
const ESTACIONALIDAD_MESES = [
  { mesOffset: 11, weight: 11, nombre: "Dic" },
  { mesOffset: 10, weight: 6, nombre: "Ene" },
  { mesOffset: 9, weight: 7, nombre: "Feb" },
  { mesOffset: 8, weight: 6, nombre: "Mar" },
  { mesOffset: 7, weight: 6, nombre: "Abr" },
  { mesOffset: 6, weight: 9, nombre: "May" },
  { mesOffset: 5, weight: 10, nombre: "Jun" },
  { mesOffset: 4, weight: 6, nombre: "Jul" },
  { mesOffset: 3, weight: 8, nombre: "Ago" },
  { mesOffset: 2, weight: 9, nombre: "Sep" },
  { mesOffset: 1, weight: 12, nombre: "Oct" },
  { mesOffset: 0, weight: 10, nombre: "Nov" },
];

/**
 * Obtiene una fecha aleatoria dentro del mes especificado (mesOffset 0..11).
 */
function obtenerFechaEnMes(mesOffset: number, ahora: Date): Date {
  if (mesOffset === 0) {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
    return faker.date.between({ from: inicioMes, to: ahora });
  }

  const ref = new Date(ahora.getFullYear(), ahora.getMonth() - mesOffset, 1);
  const anio = ref.getFullYear();
  const mes = ref.getMonth();
  const inicioMes = new Date(anio, mes, 1, 0, 0, 0);
  const finMes = new Date(anio, mes + 1, 0, 23, 59, 59);

  return faker.date.between({ from: inicioMes, to: finMes });
}

/**
 * Cotiza costo base y operador según la provincia de destino.
 */
function cotizarEnvioPorProvincia(provincia: string) {
  const operadorConfig = faker.helpers.arrayElement(OPERADORES_LOGISTICA);
  const servicio = faker.helpers.arrayElement(operadorConfig.servicios);

  let factorPrecio = 1.0;
  let demoraEstimada = 2;

  if (provincia.includes("Buenos Aires") || provincia.includes("CABA")) {
    demoraEstimada = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 1 : 2;
    factorPrecio = 1.0;
  } else if (provincia === "Córdoba" || provincia === "Santa Fe") {
    demoraEstimada = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 2 : 3;
    factorPrecio = 1.1;
  } else {
    // Provincias alejadas
    demoraEstimada = servicio.tipo.includes("Express") || servicio.tipo.includes("Rápido") ? 3 : 5;
    factorPrecio = 1.25;
  }

  const precioFinalPesos = Math.round(servicio.precioBase * factorPrecio);

  return {
    operador: operadorConfig.operador,
    servicio: servicio.tipo,
    demoraEstimada,
    costoEnvioCentavos: precioFinalPesos * 100,
  };
}

export async function seedOrdenesEItems() {
  console.log("🛍️ [03-ordenes-e-items] Generando ~1000 órdenes e ítems con todos los estados y métricas calibradas...");

  const ahora = new Date();

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

  // 3. Seleccionar compradores: 45% de los usuarios llegará a comprar (~540 compradores de 1200 usuarios)
  const porcentajeCompradores = 0.45;
  const cantCompradores = Math.floor(usuarios.length * porcentajeCompradores);
  const usuariosCompradores = faker.helpers.arrayElements<(typeof usuarios)[number]>(
    usuarios,
    cantCompradores,
  );

  console.log(
    ` • Compradores seleccionados: ${usuariosCompradores.length} de ${usuarios.length} usuarios (${(porcentajeCompradores * 100).toFixed(0)}%).`,
  );

  // Cupos controlados de inconsistencias intencionales para el pipeline de calidad de datos
  const MAX_FECHAS_INVERTIDAS = faker.number.int({ min: 8, max: 15 }); // Entre 5 y 20
  let contadorFechasInvertidas = 0;

  const MAX_IDS_FALTANTES = faker.number.int({ min: 8, max: 14 }); // Controlado en órdenes no pendientes/canceladas
  let contadorIdsFaltantes = 0;

  let totalOrdenesCreadas = 0;
  const estadisticasEstados: Record<string, number> = {};
  const estadisticasOperadores: Record<string, number> = {};
  const ordenesPorMes: Record<string, number> = {};
  let totalMontoCentavos = 0;
  let ordenesEntregadas1a3Dias = 0;
  let ordenesEntregadasMasDe3Dias = 0;

  // 4. Generar compras por comprador respetando recurrencia para alcanzar ~1000 órdenes
  for (const usuario of usuariosCompradores) {
    if (!usuario.direcciones || usuario.direcciones.length === 0) {
      continue;
    }

    const recurrenciaRandom = Math.random();
    let cantCompras = 1;
    if (recurrenciaRandom > 0.80) {
      cantCompras = faker.number.int({ min: 3, max: 6 }); // 20% hace 3 a 6 órdenes (promedio ~4.2)
    } else if (recurrenciaRandom > 0.55) {
      cantCompras = 2; // 25% hace 2 órdenes
    } // 55% hace 1 orden

    // Generamos las fechas de compras del usuario con distribución equilibrada
    const fechasCompras: Date[] = [];

    if (cantCompras === 1) {
      const mesOffset = faker.helpers.weightedArrayElement(
        ESTACIONALIDAD_MESES.map((m) => ({ weight: m.weight, value: m.mesOffset })),
      );
      fechasCompras.push(obtenerFechaEnMes(mesOffset, ahora));
    } else if (cantCompras === 2) {
      // Primera compra entre meses 11 y 2
      const mesesValidos = ESTACIONALIDAD_MESES.filter((m) => m.mesOffset >= 2);
      const mes1 = faker.helpers.weightedArrayElement(
        mesesValidos.map((m) => ({ weight: m.weight, value: m.mesOffset })),
      );
      const fecha1 = obtenerFechaEnMes(mes1, ahora);

      // Segunda compra posterior a fecha1
      const minFecha2 = new Date(fecha1.getTime() + 15 * 86400000);
      let fecha2: Date;
      if (minFecha2 >= ahora) {
        fecha2 = new Date(ahora.getTime() - faker.number.int({ min: 1, max: 24 }) * 3600000);
      } else {
        const diasHastaAhora = (ahora.getTime() - minFecha2.getTime()) / 86400000;
        const salto = faker.number.int({ min: 15, max: Math.max(16, Math.floor(diasHastaAhora)) });
        fecha2 = new Date(minFecha2.getTime() + salto * 86400000);
        if (fecha2 > ahora) fecha2 = ahora;
      }

      fechasCompras.push(fecha1, fecha2);
    } else {
      // 3 a 6 compras: la primera en meses iniciales (11 a 5)
      const mesesValidos = ESTACIONALIDAD_MESES.filter((m) => m.mesOffset >= 5);
      const mes1 = faker.helpers.weightedArrayElement(
        mesesValidos.map((m) => ({ weight: m.weight, value: m.mesOffset })),
      );
      const fecha1 = obtenerFechaEnMes(mes1, ahora);
      fechasCompras.push(fecha1);

      let fechaPrev = fecha1;
      for (let c = 1; c < cantCompras; c++) {
        const minFecha = new Date(fechaPrev.getTime() + 14 * 86400000);
        if (minFecha >= ahora) {
          fechasCompras.push(new Date(ahora.getTime() - faker.number.int({ min: 1, max: 12 }) * 3600000));
        } else {
          const diasDisponibles = (ahora.getTime() - minFecha.getTime()) / 86400000;
          const salto = faker.number.int({ min: 14, max: Math.max(15, Math.floor(diasDisponibles / (cantCompras - c))) });
          const fechaSig = new Date(minFecha.getTime() + salto * 86400000);
          const fechaFinal = fechaSig > ahora ? ahora : fechaSig;
          fechasCompras.push(fechaFinal);
          fechaPrev = fechaFinal;
        }
      }
    }

    // Coherencia: aseguramos que el usuario fue creado antes de su primera compra
    const primeraCompra = fechasCompras[0];
    if (usuario.createdAt > primeraCompra) {
      usuario.createdAt = new Date(primeraCompra.getTime() - faker.number.int({ min: 2, max: 15 }) * 86400000);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { createdAt: usuario.createdAt },
      });
    }

    // Procesamos cada orden del comprador
    for (let o = 0; o < fechasCompras.length; o++) {
      let fechaCompra = fechasCompras[o];
      const direccion = faker.helpers.arrayElement(usuario.direcciones);

      // Si la dirección tiene createdAt posterior a la compra, sincronizamos
      if (direccion.createdAt > fechaCompra) {
        direccion.createdAt = usuario.createdAt;
      }

      const envioInfo = cotizarEnvioPorProvincia(direccion.provincia);

      // Elegir vendedor y productos únicos de ese vendedor
      const vendedorElegido = faker.helpers.arrayElement(vendedoresDisponibles);
      const catalogoVendedor = perfumesPorVendedor[vendedorElegido];

      const maxItems = Math.min(4, catalogoVendedor.length);
      const cantItems = faker.number.int({ min: 1, max: maxItems });
      const perfumesElegidos = faker.helpers.arrayElements(catalogoVendedor, cantItems);

      let sumaItemsCentavos = 0;
      const itemsData = perfumesElegidos.map((prod) => {
        const cantidad = faker.helpers.weightedArrayElement([
          { weight: 80, value: 1 },
          { weight: 15, value: 2 },
          { weight: 5, value: 3 },
        ]);
        const precioUnitario = prod.precio; // Centavos
        sumaItemsCentavos += precioUnitario * cantidad;

        return {
          productoId: String(prod.id),
          precio: precioUnitario,
          cantidad,
        };
      });

      const totalOrdenCentavos = sumaItemsCentavos + envioInfo.costoEnvioCentavos;

      // DETERMINACIÓN DEL ESTADO:
      // Se garantiza presencia activa y representativa de TODOS los 6 estados:
      // PENDIENTE, PAGADO, PREPARANDO, EN_TRANSITO, ENTREGADO, CANCELADO.
      const diasAtras = (ahora.getTime() - fechaCompra.getTime()) / 86400000;
      let estado: EstadoOrden;

      if (diasAtras <= 3) {
        // Órdenes de los últimos 3 días (embudo activo inmediato)
        estado = faker.helpers.weightedArrayElement([
          { weight: 35, value: EstadoOrden.PENDIENTE },
          { weight: 35, value: EstadoOrden.PAGADO },
          { weight: 15, value: EstadoOrden.PREPARANDO },
          { weight: 5, value: EstadoOrden.EN_TRANSITO },
          { weight: 10, value: EstadoOrden.CANCELADO },
        ]);
      } else if (diasAtras <= 8) {
        // Órdenes de 4 a 8 días
        estado = faker.helpers.weightedArrayElement([
          { weight: 20, value: EstadoOrden.PENDIENTE },
          { weight: 25, value: EstadoOrden.PAGADO },
          { weight: 30, value: EstadoOrden.PREPARANDO },
          { weight: 20, value: EstadoOrden.EN_TRANSITO },
          { weight: 5, value: EstadoOrden.CANCELADO },
        ]);
      } else if (diasAtras <= 20) {
        // Órdenes de 9 a 20 días
        estado = faker.helpers.weightedArrayElement([
          { weight: 10, value: EstadoOrden.PENDIENTE },
          { weight: 15, value: EstadoOrden.PAGADO },
          { weight: 20, value: EstadoOrden.PREPARANDO },
          { weight: 25, value: EstadoOrden.EN_TRANSITO },
          { weight: 25, value: EstadoOrden.ENTREGADO },
          { weight: 5, value: EstadoOrden.CANCELADO },
        ]);
      } else if (diasAtras <= 40) {
        // Órdenes de 21 a 40 días
        estado = faker.helpers.weightedArrayElement([
          { weight: 5, value: EstadoOrden.PENDIENTE },
          { weight: 5, value: EstadoOrden.PAGADO },
          { weight: 10, value: EstadoOrden.EN_TRANSITO },
          { weight: 75, value: EstadoOrden.ENTREGADO },
          { weight: 5, value: EstadoOrden.CANCELADO },
        ]);
      } else {
        // Órdenes históricas (>40 días): la inmensa mayoría ya entregadas
        estado = Math.random() < 0.07 ? EstadoOrden.CANCELADO : EstadoOrden.ENTREGADO;
      }

      // Configuración del Ciclo de Entrega y demoraDias
      let demoraDias = envioInfo.demoraEstimada;
      let updatedAt = fechaCompra;

      if (estado === EstadoOrden.ENTREGADO) {
        // ~80% de las órdenes entregadas oscilan entre 1 y 3 días.
        // ~20% restante son excepciones de 4 a 8 días.
        const cicloDias = faker.helpers.weightedArrayElement([
          { weight: 25, value: 1 }, // 25% 1 día
          { weight: 35, value: 2 }, // 35% 2 días
          { weight: 20, value: 3 }, // 20% 3 días (Total 1-3 días: 80%)
          { weight: 7, value: 4 },  // 7% 4 días
          { weight: 5, value: 5 },  // 5% 5 días
          { weight: 4, value: 6 },  // 4% 6 días
          { weight: 2, value: 7 },  // 2% 7 días
          { weight: 2, value: 8 },  // 2% 8 días (Total 4-8 días: 20%)
        ]);

        if (cicloDias <= 3) {
          ordenesEntregadas1a3Dias++;
        } else {
          ordenesEntregadasMasDe3Dias++;
        }

        // El ciclo de entrega se completa DENTRO de los días de demora establecidos:
        demoraDias = Math.max(cicloDias, envioInfo.demoraEstimada);

        const horasJitter = faker.number.int({ min: 2, max: 18 });
        const tiempoEntregaMs = (cicloDias * 24 + horasJitter) * 3600000;

        // Aseguramos que la fechaCompra permita entregar antes de 'ahora' sin invertir fechas
        if (fechaCompra.getTime() + tiempoEntregaMs > ahora.getTime()) {
          fechaCompra = new Date(ahora.getTime() - tiempoEntregaMs - 3600000);
        }

        // CERO fechas invertidas en ENTREGADO
        updatedAt = new Date(fechaCompra.getTime() + tiempoEntregaMs);
      } else if (estado === EstadoOrden.CANCELADO) {
        // Generar un número controlado de fechas invertidas (entre 5 y 20 en total)
        // solo en órdenes CANCELADO
        if (contadorFechasInvertidas < MAX_FECHAS_INVERTIDAS && Math.random() < 0.3) {
          updatedAt = new Date(fechaCompra.getTime() - faker.number.int({ min: 2, max: 36 }) * 3600000);
          contadorFechasInvertidas++;
        } else {
          updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 1, max: 24 }) * 3600000);
        }
      } else if (estado === EstadoOrden.EN_TRANSITO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 24, max: 48 }) * 3600000);
      } else if (estado === EstadoOrden.PREPARANDO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 6, max: 24 }) * 3600000);
      } else if (estado === EstadoOrden.PAGADO) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 15, max: 120 }) * 60000);
      } else if (estado === EstadoOrden.PENDIENTE) {
        updatedAt = new Date(fechaCompra.getTime() + faker.number.int({ min: 5, max: 60 }) * 60000);
      }

      if (updatedAt > ahora && estado !== EstadoOrden.ENTREGADO) {
        updatedAt = ahora;
      }

      // Control de ids de pago y envío.
      // - Si no está paga (PENDIENTE o CANCELADO sin pago), faltan id pago y envío.
      // - Si está paga o en proceso, DEBEN estar presentes.
      // - Dejamos solo entre 8 y 14 anomalías controladas para el panel de validaciones.
      let pagoId: string | null = null;
      let envioId: string | null = null;

      const ordenEstaPaga = estado !== EstadoOrden.PENDIENTE && estado !== EstadoOrden.CANCELADO;

      if (ordenEstaPaga) {
        pagoId = `pago_seed_${faker.string.alphanumeric(14)}`;
        envioId = `TRK_SEED_${faker.string.alphanumeric(10).toUpperCase()}`;

        // Inconsistencia intencional acotada (entre 8 y 14 anomalías en total)
        if (contadorIdsFaltantes < MAX_IDS_FALTANTES && Math.random() < 0.05) {
          if (Math.random() < 0.5) {
            pagoId = null; // Falta ID de pago
          } else {
            envioId = null; // Falta ID de envío
          }
          contadorIdsFaltantes++;
        }
      } else if (estado === EstadoOrden.CANCELADO) {
        pagoId = Math.random() < 0.3 ? `pago_seed_${faker.string.alphanumeric(14)}` : null;
        envioId = null;
      }

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
          costoEnvio: envioInfo.costoEnvioCentavos,
          operadorEnvio: envioInfo.operador,
          servicioEnvio: envioInfo.servicio,
          demoraDias,
          items: {
            create: itemsData,
          },
        },
      });

      totalOrdenesCreadas++;
      totalMontoCentavos += totalOrdenCentavos;
      estadisticasEstados[estado] = (estadisticasEstados[estado] || 0) + 1;
      estadisticasOperadores[envioInfo.operador] = (estadisticasOperadores[envioInfo.operador] || 0) + 1;

      // Registrar mes para verificar distribución
      const nombreMes = fechaCompra.toLocaleString("es-AR", { month: "short", year: "2-digit" });
      ordenesPorMes[nombreMes] = (ordenesPorMes[nombreMes] || 0) + 1;
    }
  }

  const ticketPromedioPesos = Math.round(totalMontoCentavos / totalOrdenesCreadas / 100);
  const totalEntregadas = (estadisticasEstados[EstadoOrden.ENTREGADO] || 0);
  const pct1a3Dias = totalEntregadas > 0 ? ((ordenesEntregadas1a3Dias / totalEntregadas) * 100).toFixed(1) : "0";
  const pctMas3Dias = totalEntregadas > 0 ? ((ordenesEntregadasMasDe3Dias / totalEntregadas) * 100).toFixed(1) : "0";

  console.log(`✅ [03-ordenes-e-items] ${totalOrdenesCreadas} órdenes creadas exitosamente.`);
  console.log(` • Ticket promedio: $${ticketPromedioPesos.toLocaleString("es-AR")}`);

  console.log(" • Distribución mensual de órdenes (estacionalidad balanceada):");
  for (const [mes, cant] of Object.entries(ordenesPorMes)) {
    console.log(`   - ${mes}: ${cant} órdenes`);
  }

  console.log(" • Distribución por estado (con presencia activa de todos los estados):");
  for (const [est, cant] of Object.entries(estadisticasEstados)) {
    const pct = ((cant / totalOrdenesCreadas) * 100).toFixed(1);
    console.log(`   - ${est}: ${cant} (${pct}%)`);
  }

  console.log(" • Ciclo de entrega (Órdenes Entregadas):");
  console.log(`   - Entre 1 y 3 días: ${ordenesEntregadas1a3Dias} (${pct1a3Dias}%)`);
  console.log(`   - Excepciones (4 a 8 días): ${ordenesEntregadasMasDe3Dias} (${pctMas3Dias}%)`);
  console.log(`   - Fechas invertidas en ENTREGADO: 0 (Garantizado)`);

  console.log(" • Inconsistencias de calidad de datos generadas intencionalmente:");
  console.log(`   - Fechas invertidas (updatedAt < createdAt en canceladas): ${contadorFechasInvertidas} (Rango esperado: 5-20)`);
  console.log(`   - IDs faltantes en órdenes no pendientes/canceladas: ${contadorIdsFaltantes} (Rango esperado: 8-14)`);
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
