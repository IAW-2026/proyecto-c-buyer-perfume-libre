import { prisma } from "@/lib/prisma";
import { resetDatabase } from "./00-reset";
import { seedUsuarios } from "./01-usuarios";
import { seedDirecciones } from "./02-direcciones";
import { seedOrdenesEItems } from "./03-ordenes-e-items";
import { seedCarritoFavoritos } from "./04-carrito-favoritos";

export async function runAllSeeds() {
  console.log("==================================================");
  console.log("🚀 EJECUTANDO PIPELINE COMPLETO DE SEEDING");
  console.log("==================================================\n");

  const inicio = Date.now();

  try {
    // 00. Reset limpio de datos de prueba previos
    await resetDatabase();

    // 01. Usuarios con crecimiento a 12 meses
    await seedUsuarios(460);

    // 02. Direcciones ponderadas por provincias argentinas
    await seedDirecciones();

    // 03. Órdenes e ítems con estacionalidad, vendedores únicos y coherencia
    await seedOrdenesEItems();

    // 04. Favoritos y carritos respetando unique constraints
    await seedCarritoFavoritos();

    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log("==================================================");
    console.log(`🎉 PIPELINE COMPLETADO EXITOSAMENTE en ${duracion}s`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("❌ Falló la ejecución del pipeline de seed:", error);
    throw error;
  }
}

if (process.argv[1]?.includes("seeds") || process.argv[1]?.includes("seed")) {
  runAllSeeds()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
