import { RolUsuario } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker/locale/es";

/**
 * Genera una fecha de registro en los últimos 12 meses,
 * con curva de crecimiento (más altas en los meses recientes).
 */
function generarFechaUsuarioUltimos12Meses(): Date {
  const ahora = new Date();

  const mesOffset = faker.helpers.weightedArrayElement([
    { weight: 3, value: 11 }, // Hace 11 meses (lanzamiento inicial)
    { weight: 4, value: 10 },
    { weight: 4, value: 9 },
    { weight: 5, value: 8 },
    { weight: 6, value: 7 },
    { weight: 8, value: 6 },
    { weight: 9, value: 5 },
    { weight: 11, value: 4 },
    { weight: 13, value: 3 },
    { weight: 15, value: 2 },
    { weight: 18, value: 1 }, // Mes anterior (pico de registros)
    { weight: 14, value: 0 }, // Mes en curso
  ]);

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

export async function seedUsuarios(cantidad = 460) {
  console.log(`👤 [01-usuarios] Generando ${cantidad} usuarios tipo Clerk...`);

  const usuariosData: {
    id: string;
    rol: RolUsuario;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < cantidad; i++) {
    // Exactamente 2 administradores para pruebas de roles
    const rol = i < 2 ? RolUsuario.ADMIN : RolUsuario.USER;
    const clerkId = `user_seed_${faker.string.alphanumeric(24)}`;
    const createdAt = generarFechaUsuarioUltimos12Meses();

    usuariosData.push({
      id: clerkId,
      rol,
      createdAt,
    });
  }

  // Ordenamos por fecha de creación para consistencia
  usuariosData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await prisma.usuario.createMany({
    data: usuariosData,
  });

  const adminsCount = usuariosData.filter((u) => u.rol === RolUsuario.ADMIN).length;
  const usersCount = usuariosData.filter((u) => u.rol === RolUsuario.USER).length;

  console.log(`✅ [01-usuarios] ${cantidad} usuarios creados exitosamente:`);
  console.log(` • Usuarios regulares (USER): ${usersCount}`);
  console.log(` • Administradores (ADMIN):    ${adminsCount}`);
  console.log(` • Rango de registros:        ${usuariosData[0].createdAt.toISOString().split("T")[0]} al ${usuariosData[usuariosData.length - 1].createdAt.toISOString().split("T")[0]}\n`);

  return usuariosData;
}

if (process.argv[1]?.includes("01-usuarios")) {
  seedUsuarios()
    .catch((e) => {
      console.error("❌ Error en 01-usuarios:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
