import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { mockPerfumes } from "@/lib/mockPerfumes";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker/locale/es";
import textosRaw from "./resenas-textos.json";

interface TextosSeed {
  meta: {
    idioma: string;
    descripcion: string;
    estrellas: string[];
  };
  productos: Record<
    string,
    {
      nombre?: string;
      [estrella: string]: string[] | string | undefined;
    }
  >;
  productoGenerico: Record<string, string[]>;
  vendedor: Record<string, string[]>;
}

const textos = textosRaw as unknown as TextosSeed;

/**
 * Resúmenes pre-sintetizados de IA para los 32 perfumes.
 * Permiten que la ficha del producto muestre de inmediato el Resumen con Inteligencia Artificial
 * (tarjeta dorada) sin necesidad de consumir cuota de Groq ni bloquear la renderización SSR.
 */
const RESUMENES_IA_PRECOMPUTADOS: Record<
  string,
  { resumenProducto: string; resumenVendedor: string }
> = {
  "1": {
    resumenProducto:
      "Aroma clásico y sofisticado con aldehídos y fondo floral empolvado de gran fijación.",
    resumenVendedor:
      "Envío rápido con frasco precintado y excelente protección contra impactos.",
  },
  "2": {
    resumenProducto:
      "Fragancia versátil, fresca y especiada con bergamota y pimienta; estela imponente.",
    resumenVendedor:
      "Despacho inmediato, producto 100% original cerrado y atención al cliente impecable.",
  },
  "3": {
    resumenProducto:
      "Perfume dulce y seductor con notas de jazmín y cacao; ideal para salidas de noche.",
    resumenVendedor:
      "Entrega en término, paquete bien protegido y comunicación clara durante todo el envío.",
  },
  "4": {
    resumenProducto:
      "Aroma llamativo, dulce y canelado con gran proyección en invierno y eventos nocturnos.",
    resumenVendedor:
      "Muy confiable, producto sellado en caja original y despacho en el día.",
  },
  "5": {
    resumenProducto:
      "Fragancia fresca, frutal y floral muy luminosa, perfecta para el uso diario y primavera.",
    resumenVendedor:
      "Embalaje muy cuidado con plástico de burbujas, todo recibido en perfectas condiciones.",
  },
  "6": {
    resumenProducto:
      "Aroma elegante y masculino con manzana roja, canela y maderas cálidas de buena fijación.",
    resumenVendedor:
      "Vendedor responsable, envió el código de seguimiento enseguida y el pedido llegó rápido.",
  },
  "7": {
    resumenProducto:
      "Fragancia dulce e intensa con iris y praliné; fijación extraordinaria de más de 8 horas.",
    resumenVendedor:
      "Excelente experiencia, caja sellada con celofán original y entrega antes de lo esperado.",
  },
  "8": {
    resumenProducto:
      "Clásico cítrico unisex, refrescante y limpio; ideal para días calurosos y post-ducha.",
    resumenVendedor:
      "Envío seguro en caja reforzada y atención cordial en cada consulta.",
  },
  "9": {
    resumenProducto:
      "Aroma oscuro, lujoso y complejo con trufa y notas florales; gran personalidad y estela.",
    resumenVendedor:
      "Paquete ultra protegido para fragancia de alta gama, entrega puntual y producto genuino.",
  },
  "10": {
    resumenProducto:
      "Cítrico mediterráneo fresco y alegre con notas de manzana y cedro; muy elogiado en verano.",
    resumenVendedor:
      "Despacho veloz, embalaje prolijo y producto original con precinto.",
  },
  "11": {
    resumenProducto:
      "Combinación sofisticada de lavanda y flor de azahar; fragancia elegante con excelente duración.",
    resumenVendedor:
      "Atención de primera, respuesta inmediata y entrega rápida en perfecto estado.",
  },
  "12": {
    resumenProducto:
      "Fragancia oriental magnética y cálida con cuero y haba tonka; muy elogiada para citas.",
    resumenVendedor:
      "Vendedor cumplidor, producto tal como en la descripción y entrega en tiempo récord.",
  },
  "13": {
    resumenProducto:
      "Aroma fiestero y enérgico con vodka, maracuyá y menta fresca; ideal para salidas nocturnas.",
    resumenVendedor:
      "Envío ágil, embalaje firme y trato súper amable por el canal de mensajes.",
  },
  "14": {
    resumenProducto:
      "Bouquet floral luminoso y femenino con rosa y jazmín; elegancia atemporal de gran fijación.",
    resumenVendedor:
      "Excelente presentación, caja sin marcas ni golpes y envío dentro del plazo.",
  },
  "15": {
    resumenProducto:
      "Fragancia ecológica limpia y cítrica con notas de naranja y té azul; muy versátil.",
    resumenVendedor:
      "Compra sin contratiempos, despacho rápido y paquete bien sellado.",
  },
  "16": {
    resumenProducto:
      "Aroma energizante, acuático y dulce con pomelo y laurel; proyección juvenil y duradera.",
    resumenVendedor:
      "Vendedor muy recomendable, entrega rápida y artículo en perfecto estado.",
  },
  "17": {
    resumenProducto:
      "Fragancia amaderada aromática sofisticada y pulcra con cítricos e incienso de alta gama.",
    resumenVendedor:
      "Despacho exprés, empaque con doble protección y excelente atención personalizada.",
  },
  "18": {
    resumenProducto:
      "Bomba seductora con menta, manzana verde y vainilla; proyección descomunal para la noche.",
    resumenVendedor:
      "Llegó al día siguiente, frasco sellado y en perfectas condiciones de transporte.",
  },
  "19": {
    resumenProducto:
      "Firma distintiva de cuero, hojas de violeta y mandarina; aroma maduro con gran estela.",
    resumenVendedor:
      "Vendedor confiable, producto original verificado y despacho sin demoras.",
  },
  "20": {
    resumenProducto:
      "Fragancia urbana, floral y fresca con gardenia y almizcle blanco; cómoda para el día.",
    resumenVendedor:
      "Atención atenta, resolución de dudas antes de comprar y envío en fecha prometida.",
  },
  "21": {
    resumenProducto:
      "Notas de vainilla salada con jazmín acuático y flor de jengibre; dulce y envolvente.",
    resumenVendedor:
      "Paquete muy bien embalado, entrega puntual y perfume sellado de fábrica.",
  },
  "22": {
    resumenProducto:
      "Fragancia exótica y sensual con granada, orquídea negra y maderas cálidas.",
    resumenVendedor:
      "Excelente relación de servicio, rápido despacho y producto en estado impecable.",
  },
  "23": {
    resumenProducto:
      "Aroma dulce y adictivo con café negro, vainilla y flores blancas; excelente rendimiento nocturno.",
    resumenVendedor:
      "Vendedor serio, código de seguimiento al instante y producto con todo su precinto.",
  },
  "24": {
    resumenProducto:
      "Maderas nobles de oud, sándalo y vetiver con humo elegante; lujo y distinción absolutos.",
    resumenVendedor:
      "Empaque reforzado de alta seguridad, entrega eficiente y total autenticidad.",
  },
  "25": {
    resumenProducto:
      "Fragancia moderna y luminosa basada en rosas y jazmín con almizcle blanco; frasco estilizado.",
    resumenVendedor:
      "Entrega impecable, embalaje muy prolijo y producto en excelentes condiciones.",
  },
  "26": {
    resumenProducto:
      "Aroma floral radiante con nardo, jazmín y vainilla de Madagascar; alegre y duradero.",
    resumenVendedor:
      "Atención destacada, comunicación transparente y despacho en menos de 24 hs.",
  },
  "27": {
    resumenProducto:
      "Pachulí noble, rosa y naranja fresca; elegancia francesa vibrante con fijación insuperable.",
    resumenVendedor:
      "Excelente vendedor, empaque premium y producto 100% auténtico garantizado.",
  },
  "28": {
    resumenProducto:
      "Rosa centifolia aterciopelada y bouquet floral romántico; fragancia delicada y encantadora.",
    resumenVendedor:
      "Todo llegó perfecto, con caja protegida y envío entregado antes de lo esperado.",
  },
  "29": {
    resumenProducto:
      "Fragancia misteriosa y especiada con coco, cardamomo y flores oscuras; muy atractiva.",
    resumenVendedor:
      "Vendedor rápido, empaque con burbuja protectora y buena atención en todo momento.",
  },
  "30": {
    resumenProducto:
      "Aroma suave, íntimo y reconfortante de lavanda, magnolia y almizcle; ideal para el día a día.",
    resumenVendedor:
      "Envío rápido y seguro, frasco de 200 ml recibido intacto y con sello original.",
  },
  "31": {
    resumenProducto:
      "Fragancia fresca y amaderada con salvia, geranio y cedro; muy versátil y de gran fijación.",
    resumenVendedor:
      "Despacho veloz, vendedor atento y paquete recibido en condiciones inmejorables.",
  },
  "32": {
    resumenProducto:
      "Contraste audaz de pimienta blanca, cacao y haba tonka; aroma seductor en frasco de rayo.",
    resumenVendedor:
      "Envío dentro de las 24 horas, empaque bien acolchonado y atención de primera línea.",
  },
};

/**
 * Variaciones y sufijos para ampliar el repertorio y evitar repeticiones exactas
 * a lo largo de cientos de órdenes.
 */
const SUFIJOS_POSITIVOS = [
  " Muy recomendable.",
  " Súper conforme con la compra.",
  " Llegó impecable.",
  " Lo volvería a comprar sin dudar.",
  " Excelente todo.",
  " Un diez de diez.",
  " Tal cual lo esperaba.",
  " Cero quejas, todo de diez.",
  " Volveré a comprar pronto.",
];

const SUFIJOS_REGULARES = [
  " Cumple pero esperaba un poco más.",
  " Podría ser mejor.",
  " Nada del otro mundo.",
  " Correcto pero sin deslumbrar.",
];

const SUFIJOS_NEGATIVOS = [
  " No lo recomiendo.",
  " No vuelvo a comprar.",
  " Una decepción.",
  " Deberían mejorar esto.",
];

function agregarVariacionHumana(texto: string, estrellas: number): string {
  // ~25% de probabilidad de añadir un matiz o sufijo
  if (Math.random() < 0.25) {
    let pool: string[];
    if (estrellas >= 4) {
      pool = SUFIJOS_POSITIVOS;
    } else if (estrellas === 3) {
      pool = SUFIJOS_REGULARES;
    } else {
      pool = SUFIJOS_NEGATIVOS;
    }

    const sufijo = faker.helpers.arrayElement(pool);
    const base = texto.trim().replace(/\.+$/, "");
    return `${base}.${sufijo}`;
  }
  return texto;
}

/**
 * Distribución realista de estrellas para e-commerce (curva estándar de mercado):
 * - 5★: ~65%
 * - 4★: ~20%
 * - 3★: ~8%
 * - 2★: ~3.5%
 * - 1★: ~3.5%
 */
const sorteaEstrellasProducto = (): number => {
  const r = Math.random();
  return r < 0.65 ? 5 : r < 0.85 ? 4 : r < 0.93 ? 3 : r < 0.965 ? 2 : 1;
};

const sorteaEstrellasVendedor = (): number => {
  const r = Math.random();
  return r < 0.68 ? 5 : r < 0.86 ? 4 : r < 0.93 ? 3 : r < 0.97 ? 2 : 1;
};

function obtenerTextoProducto(perfumeId: string, estrellas: number): string | null {
  // 20% de reseñas son solo calificación numérica sin texto escrito
  if (Math.random() < 0.2) return null;

  const e = String(estrellas);
  const prodObj = textos.productos[perfumeId];
  const propiosRaw = prodObj?.[e];
  const propios = Array.isArray(propiosRaw) ? propiosRaw : [];
  const genericos = textos.productoGenerico[e] ?? [];

  // Mix 70% propios del perfume / 30% genéricos
  const pool =
    Math.random() < 0.7 && propios.length > 0
      ? propios
      : genericos.length > 0
        ? genericos
        : propios;

  if (!pool || pool.length === 0) return null;

  const seleccionado = faker.helpers.arrayElement(pool);
  return agregarVariacionHumana(seleccionado, estrellas);
}

function obtenerTextoVendedor(estrellas: number): string | null {
  // 20% de reseñas son solo calificación numérica
  if (Math.random() < 0.2) return null;

  const e = String(estrellas);
  const pool = textos.vendedor[e] ?? [];
  if (!pool || pool.length === 0) return null;

  const seleccionado = faker.helpers.arrayElement(pool);
  return agregarVariacionHumana(seleccionado, estrellas);
}

export async function seedResenas() {
  console.log("⭐ [05-resenas] Sembrando reseñas realistas de productos y vendedores...");

  const ahora = new Date();

  // 1. Obtener todas las órdenes ENTREGADAS de usuarios seed
  const ordenes = await prisma.ordenCompra.findMany({
    where: {
      estado: EstadoOrden.ENTREGADO,
      usuarioId: { startsWith: "user_seed_" },
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (ordenes.length === 0) {
    console.warn("⚠️ No se encontraron órdenes entregadas para sembrar reseñas.");
    return;
  }

  console.log(` • Procesando ${ordenes.length} órdenes entregadas...`);

  const resenasProductosData: Array<{
    usuarioId: string;
    ordenCompraId: string;
    productoId: string;
    puntuacion: number;
    comentario: string | null;
    createdAt: Date;
  }> = [];

  const resenasVendedoresData: Array<{
    usuarioId: string;
    ordenCompraId: string;
    vendedorId: string;
    puntuacion: number;
    comentario: string | null;
    createdAt: Date;
  }> = [];

  const seenProductoKeys = new Set<string>();
  const seenVendedorKeys = new Set<string>();

  // Contadores para resúmenes de IA posteriores
  const conteoResenasPorProducto: Record<string, number> = {};

  for (const orden of ordenes) {
    const fechaEntrega = orden.updatedAt;

    // A) Reseñas de Ítems / Productos comprados en la orden
    for (const item of orden.items) {
      const uniqueProdKey = `${orden.usuarioId}_${orden.id}_${item.productoId}`;
      if (seenProductoKeys.has(uniqueProdKey)) continue;

      // Probabilidad de que el comprador califique el producto: ~55%
      if (Math.random() < 0.55) {
        const estrellas = sorteaEstrellasProducto();
        const comentario = obtenerTextoProducto(item.productoId, estrellas);

        // Fecha de reseña: entre 12 horas y 5 días posteriores a la entrega
        const jitterHoras = faker.number.int({ min: 12, max: 120 });
        let fechaResena = new Date(fechaEntrega.getTime() + jitterHoras * 3600000);

        if (fechaResena > ahora) {
          fechaResena = new Date(
            ahora.getTime() - faker.number.int({ min: 1, max: 24 }) * 3600000,
          );
        }
        if (fechaResena < fechaEntrega) {
          fechaResena = fechaEntrega;
        }

        seenProductoKeys.add(uniqueProdKey);
        resenasProductosData.push({
          usuarioId: orden.usuarioId,
          ordenCompraId: orden.id,
          productoId: item.productoId,
          puntuacion: estrellas,
          comentario,
          createdAt: fechaResena,
        });

        conteoResenasPorProducto[item.productoId] =
          (conteoResenasPorProducto[item.productoId] || 0) + 1;
      }
    }

    // B) Reseña del Vendedor de la orden
    const uniqueVendKey = `${orden.usuarioId}_${orden.id}_${orden.vendedorId}`;
    if (!seenVendedorKeys.has(uniqueVendKey)) {
      // Probabilidad de calificar al vendedor: ~40%
      if (Math.random() < 0.4) {
        const estrellas = sorteaEstrellasVendedor();
        const comentario = obtenerTextoVendedor(estrellas);

        const jitterHoras = faker.number.int({ min: 6, max: 96 });
        let fechaResena = new Date(fechaEntrega.getTime() + jitterHoras * 3600000);

        if (fechaResena > ahora) {
          fechaResena = new Date(
            ahora.getTime() - faker.number.int({ min: 1, max: 18 }) * 3600000,
          );
        }
        if (fechaResena < fechaEntrega) {
          fechaResena = fechaEntrega;
        }

        seenVendedorKeys.add(uniqueVendKey);
        resenasVendedoresData.push({
          usuarioId: orden.usuarioId,
          ordenCompraId: orden.id,
          vendedorId: orden.vendedorId,
          puntuacion: estrellas,
          comentario,
          createdAt: fechaResena,
        });
      }
    }
  }

  // 2. Inserción en bloques (chunks) para rendimiento
  console.log(
    ` • Insertando ${resenasProductosData.length} reseñas de productos en base de datos...`,
  );
  for (let i = 0; i < resenasProductosData.length; i += 500) {
    const chunk = resenasProductosData.slice(i, i + 500);
    await prisma.resenaProducto.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  console.log(
    ` • Insertando ${resenasVendedoresData.length} reseñas de vendedores en base de datos...`,
  );
  for (let i = 0; i < resenasVendedoresData.length; i += 500) {
    const chunk = resenasVendedoresData.slice(i, i + 500);
    await prisma.resenaVendedor.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // 3. Pre-computar ResumenProductoIA para los 32 perfumes
  console.log(" • Pre-computando resúmenes de IA para catálogo de perfumes...");
  let resumenesGuardados = 0;

  for (const perfume of mockPerfumes) {
    const prodId = String(perfume.id);
    const cantidadResenas = conteoResenasPorProducto[prodId] ?? 0;
    const dataResumen = RESUMENES_IA_PRECOMPUTADOS[prodId];

    if (dataResumen && cantidadResenas >= 5) {
      await prisma.resumenProductoIA.upsert({
        where: { productoId: prodId },
        update: {
          resumenProducto: dataResumen.resumenProducto,
          resumenVendedor: dataResumen.resumenVendedor,
          resenasProcesadas: cantidadResenas,
        },
        create: {
          productoId: prodId,
          resumenProducto: dataResumen.resumenProducto,
          resumenVendedor: dataResumen.resumenVendedor,
          resenasProcesadas: cantidadResenas,
        },
      });
      resumenesGuardados++;
    }
  }

  console.log("✅ [05-resenas] Sembrado de reseñas y resúmenes completado:");
  console.log(` • Reseñas de productos creadas:  ${resenasProductosData.length}`);
  console.log(` • Reseñas de vendedores creadas: ${resenasVendedoresData.length}`);
  console.log(` • Resúmenes de IA precomputados: ${resumenesGuardados} de 32\n`);
}

if (process.argv[1]?.includes("05-resenas")) {
  seedResenas()
    .catch((e) => {
      console.error("❌ Error en 05-resenas:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
