import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🧹 Iniciando limpieza de datos de prueba en la base de datos...\n");

  const condicionOrdenesMock = {
    OR: [
      { usuarioId: { startsWith: "mock_user_" } },
      { pagoId: { startsWith: "pago_mock_" } },
      { id: { startsWith: "mock_ord_" } },
      { envioId: { startsWith: "TRK_MOCK_" } },
    ],
  };

  const condicionUsuariosMock = {
    id: { startsWith: "mock_user_" },
  };

  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Eliminar ítems de órdenes de prueba (requerido por foreign key con OrdenCompra)
    const items = await tx.itemOrdenCompra.deleteMany({
      where: {
        ordenCompra: condicionOrdenesMock,
      },
    });

    // 2. Eliminar órdenes de prueba
    const ordenes = await tx.ordenCompra.deleteMany({
      where: condicionOrdenesMock,
    });

    // 3. Eliminar direcciones creadas para usuarios de prueba
    const direcciones = await tx.direccion.deleteMany({
      where: {
        usuarioId: { startsWith: "mock_user_" },
      },
    });

    // 4. Eliminar carritos y favoritos vinculados a usuarios de prueba (por si existen)
    const carritos = await tx.carrito.deleteMany({
      where: {
        usuarioId: { startsWith: "mock_user_" },
      },
    });

    const favoritos = await tx.favorito.deleteMany({
      where: {
        usuarioId: { startsWith: "mock_user_" },
      },
    });

    // 5. Eliminar usuarios de prueba
    const usuarios = await tx.usuario.deleteMany({
      where: condicionUsuariosMock,
    });

    return {
      items: items.count,
      ordenes: ordenes.count,
      direcciones: direcciones.count,
      carritos: carritos.count,
      favoritos: favoritos.count,
      usuarios: usuarios.count,
    };
  });

  console.log("✅ Limpieza completada con éxito:");
  console.log(` • Ítems de órdenes eliminados: ${resultado.items}`);
  console.log(` • Órdenes de compra eliminadas: ${resultado.ordenes}`);
  console.log(` • Direcciones eliminadas:       ${resultado.direcciones}`);
  if (resultado.carritos > 0) {
    console.log(` • Carritos eliminados:          ${resultado.carritos}`);
  }
  if (resultado.favoritos > 0) {
    console.log(` • Favoritos eliminados:         ${resultado.favoritos}`);
  }
  console.log(` • Usuarios mock eliminados:     ${resultado.usuarios}`);
}

main()
  .catch((e) => {
    console.error("❌ Error al limpiar datos de prueba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
