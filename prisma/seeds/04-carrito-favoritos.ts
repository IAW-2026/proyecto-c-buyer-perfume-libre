import { mockPerfumes } from "@/lib/mockPerfumes";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker/locale/es";

// Asignamos mayor peso a perfumes populares para que se repitan más en favoritos
const PERFUMES_PONDERADOS = mockPerfumes.map((p) => {
  const esPopular = [
    "1", // Chanel No. 5
    "2", // Dior Sauvage
    "3", // Good Girl
    "4", // 1 Million
    "5", // Bright Crystal
    "7", // La Vie Est Belle
    "9", // Black Orchid
    "10", // Light Blue
    "11", // Black Opium
    "12", // Acqua Di Gio
  ].includes(String(p.id));

  return {
    weight: esPopular ? 15 : 3,
    value: String(p.id),
  };
});

export async function seedCarritoFavoritos() {
  console.log("❤️ [04-carrito-favoritos] Asignando favoritos y carritos activos...");

  const usuarios = await prisma.usuario.findMany({
    where: { id: { startsWith: "user_seed_" } },
    select: { id: true },
  });

  if (usuarios.length === 0) {
    throw new Error("No hay usuarios seed creados. Ejecuta primero 01-usuarios.ts");
  }

  const favoritosData: { usuarioId: string; productoId: string }[] = [];
  const carritosData: { usuarioId: string; productoId: string; cantidad: number }[] = [];

  for (const usuario of usuarios) {
    // 1. FAVORITOS: para casi todos los usuarios (85% tienen entre 1 y 8 favoritos, 15% tienen 0)
    if (Math.random() < 0.85) {
      const cantFavoritos = faker.number.int({ min: 1, max: 8 });
      const productosFavoritosSet = new Set<string>();

      // Evitamos duplicados para respetar @@unique([usuarioId, productoId])
      let intentos = 0;
      while (productosFavoritosSet.size < cantFavoritos && intentos < 30) {
        intentos++;
        const prodId = faker.helpers.weightedArrayElement(PERFUMES_PONDERADOS);
        productosFavoritosSet.add(prodId);
      }

      for (const productoId of productosFavoritosSet) {
        favoritosData.push({
          usuarioId: usuario.id,
          productoId,
        });
      }
    }

    // 2. CARRITOS: cerca del 15% de los usuarios tienen productos en carrito pendiente
    if (Math.random() < 0.15) {
      const cantItemsCarrito = faker.number.int({ min: 1, max: 3 });
      const productosCarritoSet = new Set<string>();

      let intentos = 0;
      while (productosCarritoSet.size < cantItemsCarrito && intentos < 20) {
        intentos++;
        const prodId = faker.helpers.arrayElement(mockPerfumes).id;
        productosCarritoSet.add(String(prodId));
      }

      for (const productoId of productosCarritoSet) {
        carritosData.push({
          usuarioId: usuario.id,
          productoId,
          cantidad: faker.number.int({ min: 1, max: 3 }),
        });
      }
    }
  }

  // Inserción en batch
  if (favoritosData.length > 0) {
    await prisma.favorito.createMany({
      data: favoritosData,
    });
  }

  if (carritosData.length > 0) {
    await prisma.carrito.createMany({
      data: carritosData,
    });
  }

  const usuariosConCarrito = new Set(carritosData.map((c) => c.usuarioId)).size;
  const usuariosConFavorito = new Set(favoritosData.map((f) => f.usuarioId)).size;

  console.log(`✅ [04-carrito-favoritos] Proceso completado:`);
  console.log(` • Total favoritos creados: ${favoritosData.length} (en ${usuariosConFavorito} usuarios, ~${((usuariosConFavorito / usuarios.length) * 100).toFixed(0)}%)`);
  console.log(` • Total ítems de carrito:  ${carritosData.length} (en ${usuariosConCarrito} usuarios, ~${((usuariosConCarrito / usuarios.length) * 100).toFixed(0)}%)\n`);
}

if (process.argv[1]?.includes("04-carrito-favoritos")) {
  seedCarritoFavoritos()
    .catch((e) => {
      console.error("❌ Error en 04-carrito-favoritos:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
