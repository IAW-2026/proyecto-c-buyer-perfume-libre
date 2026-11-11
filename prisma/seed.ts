import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { mockPerfumes } from "@/lib/mockPerfumes";
import { obtenerCotizacionesEnvioMock } from "@/lib/mockEnvios";
import { faker } from "@faker-js/faker/locale/es";

function generarFechaCompraEscalonada(): Date {
  const ahora = new Date();

  // Offset en meses (0 = mes actual, 5 = hace 5 meses)
  const mesOffset = faker.helpers.weightedArrayElement([
    { weight: 6, value: 5 },
    { weight: 10, value: 4 },
    { weight: 15, value: 3 },
    { weight: 22, value: 2 },
    { weight: 32, value: 1 },
    { weight: 15, value: 0 },
  ]);

  if (mesOffset === 0) {
    // Mes actual: desde el día 1 hasta la fecha/hora actual
    const inicioMes = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1,
      0,
      0,
      0,
    );
    return faker.date.between({ from: inicioMes, to: ahora });
  }

  // Meses anteriores: fecha aleatoria entre el día 1 y el último día de ese mes específico
  const fechaReferencia = new Date(
    ahora.getFullYear(),
    ahora.getMonth() - mesOffset,
    1,
  );
  const anio = fechaReferencia.getFullYear();
  const mes = fechaReferencia.getMonth();

  const inicioMes = new Date(anio, mes, 1, 0, 0, 0);
  const finMes = new Date(anio, mes + 1, 0, 23, 59, 59);

  return faker.date.between({ from: inicioMes, to: finMes });
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

  console.log("1. Cargando catálogo mock de perfumes y opciones de envío...");
  const productos = mockPerfumes;
  const opcionesEnvio = await obtenerCotizacionesEnvioMock();

  if (productos.length === 0) {
    throw new Error("No hay productos en el mock de perfumes.");
  }

  console.log(`2. Creando ${cantidadUsuarios} usuarios de prueba...`);
  const usuarios = [];
  for (let i = 0; i < cantidadUsuarios; i++) {
    // Los usuarios se crean con una fecha anterior al rango de compras para garantizar coherencia
    const usuario = await prisma.usuario.create({
      data: {
        id: `mock_user_${faker.string.alphanumeric(10)}`,
        createdAt: faker.date.between({
          from: new Date(Date.now() - 220 * 86400000),
          to: new Date(Date.now() - 175 * 86400000),
        }),
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
    `3. Generando ${cantidadOrdenes} compras simuladas con distribución realista...`,
  );

  for (let i = 0; i < cantidadOrdenes; i++) {
    const usuario = faker.helpers.arrayElement(usuarios);
    const direccion = usuario.direcciones[0];
    const productoElegido = faker.helpers.arrayElement(productos);
    const envioElegido = faker.helpers.arrayElement(opcionesEnvio);
    const fechaCompra = generarFechaCompraEscalonada();

    const cantidad = faker.helpers.weightedArrayElement([
      { weight: 80, value: 1 },
      { weight: 15, value: 2 },
      { weight: 5, value: 3 },
    ]);

    const costoEnvioCentavos = envioElegido.precio * 100;
    const precioProductoCentavos = productoElegido.precio;
    const totalCentavos =
      precioProductoCentavos * cantidad + costoEnvioCentavos;

    const orden = await prisma.ordenCompra.create({
      data: {
        usuarioId: usuario.id,
        vendedorId: productoElegido.vendedor || "vendedor_mock",
        pagoId: `pago_mock_${faker.string.alphanumeric(10)}`,
        envioId: `TRK_MOCK_${faker.string.alphanumeric(8).toUpperCase()}`,
        estado: EstadoOrden.ENTREGADO,
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
              productoId: String(productoElegido.id),
              precio: precioProductoCentavos,
              cantidad: cantidad,
            },
          ],
        },
      },
    });

    console.log(
      `[${i + 1}/${cantidadOrdenes}] Orden procesada (ID: ${orden.id}, Fecha: ${fechaCompra.toISOString().split("T")[0]})`,
    );
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
