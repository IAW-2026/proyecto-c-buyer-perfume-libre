import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker/locale/es";

interface UbicacionPreset {
  provincia: string;
  localidades: { localidad: string; cp: string }[];
}

const PROVINCIAS_ARGENTINAS: { weight: number; value: UbicacionPreset }[] = [
  {
    weight: 35,
    value: {
      provincia: "Buenos Aires",
      localidades: [
        { localidad: "La Plata", cp: "1900" },
        { localidad: "Mar del Plata", cp: "7600" },
        { localidad: "Bahía Blanca", cp: "8000" },
        { localidad: "San Isidro", cp: "1642" },
        { localidad: "Quilmes", cp: "1878" },
        { localidad: "Morón", cp: "1708" },
        { localidad: "Tandil", cp: "7000" },
        { localidad: "Pilar", cp: "1629" },
        { localidad: "Vicente López", cp: "1638" },
        { localidad: "Lomas de Zamora", cp: "1832" },
      ],
    },
  },
  {
    weight: 25,
    value: {
      provincia: "Ciudad Autónoma de Buenos Aires",
      localidades: [
        { localidad: "Palermo", cp: "1414" },
        { localidad: "Recoleta", cp: "1425" },
        { localidad: "Belgrano", cp: "1428" },
        { localidad: "Caballito", cp: "1405" },
        { localidad: "Villa Urquiza", cp: "1431" },
        { localidad: "San Telmo", cp: "1063" },
        { localidad: "Almagro", cp: "1182" },
        { localidad: "Flores", cp: "1406" },
      ],
    },
  },
  {
    weight: 15,
    value: {
      provincia: "Córdoba",
      localidades: [
        { localidad: "Córdoba", cp: "5000" },
        { localidad: "Villa Carlos Paz", cp: "5152" },
        { localidad: "Río Cuarto", cp: "5800" },
        { localidad: "Villa María", cp: "5900" },
        { localidad: "Alta Gracia", cp: "5186" },
      ],
    },
  },
  {
    weight: 12,
    value: {
      provincia: "Santa Fe",
      localidades: [
        { localidad: "Rosario", cp: "2000" },
        { localidad: "Santa Fe", cp: "3000" },
        { localidad: "Rafaela", cp: "2300" },
        { localidad: "Venado Tuerto", cp: "2600" },
      ],
    },
  },
  {
    weight: 5,
    value: {
      provincia: "Mendoza",
      localidades: [
        { localidad: "Mendoza", cp: "5500" },
        { localidad: "San Rafael", cp: "5600" },
        { localidad: "Godoy Cruz", cp: "5501" },
      ],
    },
  },
  {
    weight: 3,
    value: {
      provincia: "Tucumán",
      localidades: [
        { localidad: "San Miguel de Tucumán", cp: "4000" },
        { localidad: "Yerba Buena", cp: "4107" },
      ],
    },
  },
  {
    weight: 2,
    value: {
      provincia: "Neuquén",
      localidades: [
        { localidad: "Neuquén", cp: "8300" },
        { localidad: "San Martín de los Andes", cp: "8370" },
      ],
    },
  },
  {
    weight: 2,
    value: {
      provincia: "Salta",
      localidades: [
        { localidad: "Salta", cp: "4400" },
        { localidad: "San Lorenzo", cp: "4401" },
      ],
    },
  },
  {
    weight: 1,
    value: {
      provincia: "Entre Ríos",
      localidades: [
        { localidad: "Paraná", cp: "3100" },
        { localidad: "Concordia", cp: "3200" },
      ],
    },
  },
];

export async function seedDirecciones() {
  console.log("📍 [02-direcciones] Asignando direcciones ponderadas a usuarios de prueba...");

  const usuarios = await prisma.usuario.findMany({
    where: { id: { startsWith: "user_seed_" } },
    select: { id: true, createdAt: true },
  });

  if (usuarios.length === 0) {
    throw new Error("No hay usuarios seed encontrados. Corre primero 01-usuarios.ts");
  }

  const direccionesData: {
    usuarioId: string;
    provincia: string;
    codigoPostal: string;
    localidad: string;
    calle: string;
    altura: string;
    pisoDepto: string | null;
    telefono: string;
    nombreDestinatario: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  for (const usuario of usuarios) {
    // 75% tienen 1 dirección, 25% tienen 2 direcciones (casa y trabajo/familiar)
    const cantDirecciones = Math.random() < 0.25 ? 2 : 1;

    for (let d = 0; d < cantDirecciones; d++) {
      const ubicacionPreset = faker.helpers.weightedArrayElement(PROVINCIAS_ARGENTINAS);
      const locElegida = faker.helpers.arrayElement(ubicacionPreset.localidades);

      const pisoDepto =
        Math.random() < 0.35
          ? `${faker.number.int({ min: 1, max: 14 })}° ${faker.helpers.arrayElement(["A", "B", "C", "D", "E"])}`
          : null;

      // La dirección se crea poco después del registro del usuario
      const fechaCreacionDir = new Date(
        usuario.createdAt.getTime() + faker.number.int({ min: 1, max: 72 }) * 3600000,
      );

      direccionesData.push({
        usuarioId: usuario.id,
        provincia: ubicacionPreset.provincia,
        localidad: locElegida.localidad,
        codigoPostal: locElegida.cp,
        calle: faker.location.street(),
        altura: String(faker.number.int({ min: 50, max: 7500 })),
        pisoDepto,
        telefono: faker.phone.number(),
        nombreDestinatario: faker.person.fullName(),
        createdAt: fechaCreacionDir,
        updatedAt: fechaCreacionDir,
      });
    }
  }

  await prisma.direccion.createMany({
    data: direccionesData,
  });

  // Estadísticas por provincia para verificar la distribución geográfica
  const statsProvincia: Record<string, number> = {};
  for (const dir of direccionesData) {
    statsProvincia[dir.provincia] = (statsProvincia[dir.provincia] || 0) + 1;
  }

  console.log(`✅ [02-direcciones] ${direccionesData.length} direcciones creadas para ${usuarios.length} usuarios.`);
  console.log(" • Distribución por provincia:");
  for (const [prov, cant] of Object.entries(statsProvincia)) {
    const pct = ((cant / direccionesData.length) * 100).toFixed(1);
    console.log(`   - ${prov}: ${cant} (${pct}%)`);
  }
  console.log("");

  return direccionesData;
}

if (process.argv[1]?.includes("02-direcciones")) {
  seedDirecciones()
    .catch((e) => {
      console.error("❌ Error en 02-direcciones:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
