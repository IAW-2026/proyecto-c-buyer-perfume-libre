import { EstadoOrden } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { mockPerfumes } from "@/lib/mockPerfumes";
import { obtenerCotizacionesEnvioMock } from "@/lib/mockEnvios";
import { faker } from "@faker-js/faker/locale/es";

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
    const usuario = await prisma.usuario.create({
      data: {
        id: `mock_user_${faker.string.alphanumeric(10)}`,
        createdAt: faker.date.recent({ days: 180 }),
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

  console.log(`3. Generando ${cantidadOrdenes} compras simuladas...`);

  for (let i = 0; i < cantidadOrdenes; i++) {
    const usuario = faker.helpers.arrayElement(usuarios);
    const direccion = usuario.direcciones[0];
    const productoElegido = faker.helpers.arrayElement(productos);
    const envioElegido = faker.helpers.arrayElement(opcionesEnvio);
    const fechaCompra = faker.date.recent({ days: 90 });

    const costoEnvioCentavos = envioElegido.precio * 100;
    const precioProductoCentavos = productoElegido.precio;
    const totalCentavos = precioProductoCentavos + costoEnvioCentavos;

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
              cantidad: 1,
            },
          ],
        },
      },
    });

    console.log(
      `[${i + 1}/${cantidadOrdenes}] Orden procesada (ID: ${orden.id})`,
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
