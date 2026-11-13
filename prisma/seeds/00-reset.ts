import { prisma } from "@/lib/prisma";

export async function resetDatabase() {
  console.log("🧹 [00-reset] Iniciando borrado seguro de datos de prueba...");

  // Identificadores de órdenes de prueba generadas por los seeds
  const condicionOrdenesSeed = {
    OR: [
      { usuarioId: { startsWith: "user_seed_" } },
      { usuarioId: { startsWith: "mock_user_" } },
      { pagoId: { startsWith: "pago_seed_" } },
      { pagoId: { startsWith: "pago_mock_" } },
      { id: { startsWith: "ord_seed_" } },
      { id: { startsWith: "mock_ord_" } },
      { envioId: { startsWith: "TRK_SEED_" } },
      { envioId: { startsWith: "TRK_MOCK_" } },
    ],
  };

  // Identificadores de usuarios de prueba generados por los seeds
  const condicionUsuariosSeed = {
    OR: [
      { id: { startsWith: "user_seed_" } },
      { id: { startsWith: "mock_user_" } },
    ],
  };

  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Ítems de órdenes de prueba (requerido por foreign key)
    const items = await tx.itemOrdenCompra.deleteMany({
      where: { ordenCompra: condicionOrdenesSeed },
    });

    // 2. Órdenes de prueba
    const ordenes = await tx.ordenCompra.deleteMany({
      where: condicionOrdenesSeed,
    });

    // 3. Carritos vinculados a usuarios de prueba
    const carritos = await tx.carrito.deleteMany({
      where: { usuario: condicionUsuariosSeed },
    });

    // 4. Favoritos vinculados a usuarios de prueba
    const favoritos = await tx.favorito.deleteMany({
      where: { usuario: condicionUsuariosSeed },
    });

    // 5. Direcciones vinculadas a usuarios de prueba
    const direcciones = await tx.direccion.deleteMany({
      where: { usuario: condicionUsuariosSeed },
    });

    // 6. Resúmenes de prueba (si existieran con prefijo seed/mock)
    const resumenes = await tx.resumenProductoIA.deleteMany({
      where: {
        OR: [
          { productoId: { startsWith: "seed_" } },
          { productoId: { startsWith: "mock_" } },
        ],
      },
    });

    // 7. Usuarios de prueba
    const usuarios = await tx.usuario.deleteMany({
      where: condicionUsuariosSeed,
    });

    return {
      items: items.count,
      ordenes: ordenes.count,
      carritos: carritos.count,
      favoritos: favoritos.count,
      direcciones: direcciones.count,
      resumenes: resumenes.count,
      usuarios: usuarios.count,
    };
  });

  console.log("✅ [00-reset] Limpieza de datos de prueba completada:");
  console.log(` • Ítems eliminados:        ${resultado.items}`);
  console.log(` • Órdenes eliminadas:      ${resultado.ordenes}`);
  console.log(` • Carritos eliminados:     ${resultado.carritos}`);
  console.log(` • Favoritos eliminados:    ${resultado.favoritos}`);
  console.log(` • Direcciones eliminadas:  ${resultado.direcciones}`);
  if (resultado.resumenes > 0) {
    console.log(` • Resúmenes eliminados:    ${resultado.resumenes}`);
  }
  console.log(` • Usuarios eliminados:     ${resultado.usuarios}\n`);

  return resultado;
}

if (process.argv[1]?.includes("00-reset")) {
  resetDatabase()
    .catch((e) => {
      console.error("❌ Error en 00-reset:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
