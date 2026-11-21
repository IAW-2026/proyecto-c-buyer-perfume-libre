/**
 * Script de backfill para poblar snapshots históricos en ItemOrdenCompra existentes.
 * 
 * Uso:
 *   npx tsx scripts/backfill-item-snapshots.ts
 */

import { prisma } from "@/lib/prisma";
import { obtenerSnapshotsProductos } from "@/lib/api";

async function main() {
  console.log("Iniciando backfill de snapshots para ItemOrdenCompra...");

  const itemsSinSnapshot = await prisma.itemOrdenCompra.findMany({
    where: {
      OR: [
        { nombre: null },
        { imagenUrl: null },
      ],
    },
    select: {
      id: true,
      productoId: true,
      ordenCompraId: true,
    },
  });

  if (itemsSinSnapshot.length === 0) {
    console.log("✔ Todos los ítems ya cuentan con snapshot histórico. Nada que actualizar.");
    return;
  }

  console.log(`Encontrados ${itemsSinSnapshot.length} ítems sin snapshot.`);

  const uniqueIds = Array.from(new Set(itemsSinSnapshot.map((i) => i.productoId)));
  console.log(`Consultando datos para ${uniqueIds.length} productos únicos...`);

  const mapaSnapshots = await obtenerSnapshotsProductos(uniqueIds);

  let actualizados = 0;
  for (const item of itemsSinSnapshot) {
    const snapshot = mapaSnapshots.get(item.productoId);
    if (snapshot) {
      await prisma.itemOrdenCompra.update({
        where: { id: item.id },
        data: {
          nombre: snapshot.nombre,
          marca: snapshot.marca,
          imagenUrl: snapshot.imagenUrl,
          vendedor: snapshot.vendedor,
        },
      });
      actualizados++;
    } else {
      console.warn(`No se encontró snapshot para productoId ${item.productoId} (item ${item.id}). Asignando fallback seguro.`);
      await prisma.itemOrdenCompra.update({
        where: { id: item.id },
        data: {
          nombre: "Perfume Histórico",
          marca: "Marca",
          imagenUrl: "/placeholder-perfume.jpg",
          vendedor: "Vendedor Oficial",
        },
      });
      actualizados++;
    }
  }

  console.log(`✔ Backfill completado exitosamente: ${actualizados} ítems actualizados.`);
}

main()
  .catch((err) => {
    console.error("Error durante el backfill:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
