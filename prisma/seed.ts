import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker/locale/es";

interface ProductoSeller {
  producto_id: string;
  vendedor_id: string;
  precio: number;
  titulo: string;
  imagen?: string;
}

interface OpcionEnvio {
  operador: string;
  tipo_servicio: string;
  precio: number;
  demora_dias: number;
}

const SELLER_API_URL =
  process.env.SELLER_API_URL ||
  "https://proyecto-c-seller-perfume-libre.vercel.app/api";
const SHIPPING_API_URL =
  process.env.SHIPPING_API_URL ||
  "https://proyecto-c-shipping2-perfume-libre.vercel.app/api";
const FEEDBACK_API_URL =
  process.env.FEEDBACK_API_URL ||
  "https://proyecto-c-feedback2-perfume-libre.vercel.app/api";

async function cotizarEnvioSeed(
  codigo_postal: string,
  direccion_entrega: string,
): Promise<OpcionEnvio[]> {
  try {
    const bodyData = { codigo_postal, direccion_entrega };

    const response = await fetch(`${SHIPPING_API_URL}/shipping/cotizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();

    if (!data.opciones || !Array.isArray(data.opciones)) {
      throw new Error("Formato inválido");
    }
    return data.opciones;
  } catch (error) {
    console.warn(
      `⚠️ Cotización real falló para CP ${codigo_postal}, usando Mock.`,
    );
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
    ];
  }
}

async function main() {
  let cantidadUsuarios = 5;
  let cantidadOrdenes = 20;

  process.argv.forEach((val) => {
    if (val.startsWith("--usuarios=")) {
      cantidadUsuarios = parseInt(val.split("=")[1], 10);
    }
    if (val.startsWith("--ordenes=")) {
      cantidadOrdenes = parseInt(val.split("=")[1], 10);
    }
  });

  console.log(
    `Corriendo seed con ${cantidadUsuarios} usuarios y ${cantidadOrdenes} órdenes...`,
  );

  console.log("1. Obteniendo catálogo real de Seller App...");

  const headers = new Headers();
  headers.append("titulo", " ");
  headers.append("categorias", JSON.stringify([]));
  headers.append("pagina", "1");
  headers.append("cantidad_pagina", "50");
  headers.append("api_key", process.env.SELLER_API_KEY || "");

  const responseSeller = await fetch(`${SELLER_API_URL}/seller/productos`, {
    method: "GET",
    headers: headers,
  });

  if (!responseSeller.ok) throw new Error("Falló Seller API");
  const dataSeller = await responseSeller.json();
  const productos: ProductoSeller[] = dataSeller.items || [];

  if (productos.length === 0) throw new Error("No hay productos en Seller App");

  console.log(`2. Creando ${cantidadUsuarios} usuarios de prueba...`);
  const usuarios = [];
  for (let i = 0; i < cantidadUsuarios; i++) {
    const usuario = await prisma.usuario.create({
      data: {
        id: `mock_user_${faker.string.alphanumeric(10)}`,
        createdAt: faker.date.recent({ days: 90 }),
        direcciones: {
          create: {
            provincia: faker.location.state(),
            codigoPostal: faker.location.zipCode(),
            localidad: faker.location.city(),
            calle: faker.location.street(),
            altura: faker.location.buildingNumber(),
            telefono: faker.phone.number(),
            nombreDestinatario: faker.person.fullName(),
          },
        },
      },
      include: { direcciones: true },
    });
    usuarios.push(usuario);
  }

  console.log(
    `3. Generando ${cantidadOrdenes} compras y sincronizando con Shipping y Feedback...`,
  );

  for (let i = 0; i < cantidadOrdenes; i++) {
    const usuario = faker.helpers.arrayElement(usuarios);
    const direccion = usuario.direcciones[0];
    const productoElegido = faker.helpers.arrayElement(productos);
    const fechaCompra = faker.date.recent({ days: 90 });

    const opcionesEnvio = await cotizarEnvioSeed(
      direccion.codigoPostal,
      `${direccion.calle} ${direccion.altura}`,
    );

    const envioElegido = faker.helpers.arrayElement(opcionesEnvio);

    const costoEnvioCentavos = envioElegido.precio * 100;
    const precioProductoCentavos = Math.round(Number(productoElegido.precio));
    const totalCentavos = precioProductoCentavos + costoEnvioCentavos;

    const orden = await prisma.ordenCompra.create({
      data: {
        usuarioId: usuario.id,
        vendedorId: productoElegido.vendedor_id || "vendedor_mock",
        pagoId: `pago_mock_${faker.string.alphanumeric(10)}`,
        estado: "ENTREGADA",
        total: totalCentavos,
        createdAt: fechaCompra,
        updatedAt: fechaCompra,
        direccionId: direccion.id,
        costoEnvio: costoEnvioCentavos,
        operadorEnvio: envioElegido.operador,
        servicioEnvio: envioElegido.tipo_servicio,
        demoraDias: envioElegido.demora_dias,
        items: {
          create: [
            {
              productoId: String(productoElegido.producto_id),
              precio: precioProductoCentavos,
              cantidad: 1,
            },
          ],
        },
      },
    });
    try {
      const bodyShipping = {
        id_orden: orden.id,
        id_pedido: orden.id,
        id_comprador: usuario.id,
        id_vendedor: productoElegido.vendedor_id || "vendedor_desconocido",
        direccion_entrega: `${direccion.calle} ${direccion.altura}`,
        items: [{ productoId: productoElegido.producto_id }],
        servicio_elegido: {
          operador: envioElegido.operador,
          precio: envioElegido.precio,
          tipo_servicio: envioElegido.tipo_servicio,
          demora_dias: envioElegido.demora_dias,
        },
        usuarioId: usuario.id,
      };

      const resShipping = await fetch(`${SHIPPING_API_URL}/shipping/ordenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyShipping),
      });

      if (resShipping.ok) {
        const dataShipping = await resShipping.json();
        await prisma.ordenCompra.update({
          where: { id: orden.id },
          data: { envioId: dataShipping.trackingId || `TRK-${orden.id}` },
        });
      }
    } catch (e) {
      console.warn(
        `No se pudo sincronizar envío de orden ${orden.id} con Shipping App`,
      );
    }

    if (Math.random() > 0.5) {
      const calificacion = faker.number.int({ min: 1, max: 5 });

      const comentario =
        calificacion < 3
          ? faker.helpers.arrayElement([
              "Llegó roto",
              "El aroma no dura nada",
              "No es lo que esperaba",
              "Mala atención del vendedor",
            ])
          : faker.helpers.arrayElement(["", "Excelente perfume", "Me encantó"]);

      try {
        await fetch(`${FEEDBACK_API_URL}/resenas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId: usuario.id,
            productoId: String(productoElegido.producto_id),
            vendedorId: productoElegido.vendedor_id || "vendedor_mock",
            ordenCompraId: orden.id,
            calificacion: calificacion,
            comentario: comentario,
          }),
        });
      } catch (e) {
        console.warn(`No se pudo crear reseña para orden ${orden.id}`);
      }
    }

    console.log(`[${i + 1}/${cantidadOrdenes}] Orden procesada`);
  }

  console.log(`Simulación completada con éxito.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
