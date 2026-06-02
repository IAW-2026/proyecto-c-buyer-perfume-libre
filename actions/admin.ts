"use server";

import { currentUser } from "@clerk/nextjs/server";
import { obtenerRolUsuario } from "./usuario";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EstadoOrdenType, EstadosOrden } from "@/schema/perfume.schema";
import { revalidatePath } from "next/cache";

const EstadosOrdenInactivas: EstadoOrdenType[] = [
  EstadosOrden.enum.Pendiente,
  EstadosOrden.enum.Cancelado,
  EstadosOrden.enum.Rechazado,
];

// Simulación de comisión del 10%
const comision = 0.1;

export async function obtenerAdminPageData() {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const rolUsuario = await obtenerRolUsuario();

    if (rolUsuario?.rol !== RolUsuario.ADMIN) {
      return null;
    }

    const [gananciaNeta, cantOrdenes, cantUsuarios, historialGrafico] =
      await Promise.all([
        calcularGanancias(),
        obtenerTotalOrdenes(),
        obtenerTotalUsuariosActivos(),
        obtenerGraficoVentas(),
      ]);

    return {
      ganancia: gananciaNeta,
      ordenes: cantOrdenes,
      usuarios: cantUsuarios,
      grafico: historialGrafico,
    };
  } catch (error) {
    throw new Error("Error al cargar los datos del panel de control");
  }
}

async function calcularGanancias() {
  try {
    const totalGanancia = await prisma.ordenCompra.aggregate({
      _sum: { total: true },
    });

    const gananciaNeta = (totalGanancia._sum.total || 0) * comision;

    return gananciaNeta;
  } catch (error) {
    throw new Error("No se pudo calcular las ganancias");
  }
}

async function obtenerTotalOrdenes() {
  try {
    const cantOrdenes = await prisma.ordenCompra.count({
      where: {
        estado: {
          notIn: EstadosOrdenInactivas,
        },
      },
    });
    return cantOrdenes;
  } catch (error) {
    throw new Error("No se pudo calcular la cantidad de órdenes");
  }
}

async function obtenerTotalUsuariosActivos() {
  try {
    const cantUsuarios = await prisma.usuario.count({
      where: {
        compras: {
          some: {},
        },
      },
    });
    return cantUsuarios;
  } catch (error) {
    throw new Error("No se pudo calcular la cantidad de usuarios activos");
  }
}

// x variable, por ahora no se utiliza, pero se deja para futuras mejoras
// donde se pueda elegir el rango de meses a mostrar en el gráfico
async function obtenerGraficoVentas(x: number = 6) {
  try {
    const fechaHaceXmeses = new Date();
    fechaHaceXmeses.setDate(1);
    fechaHaceXmeses.setMonth(fechaHaceXmeses.getMonth() - x);

    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const ultimasOrdenes = await prisma.ordenCompra.findMany({
      where: {
        createdAt: { gte: fechaHaceXmeses },
        estado: { notIn: EstadosOrdenInactivas },
      },
      select: { createdAt: true, total: true },
    });

    const resultados = Array.from({ length: x }).map((_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (x - 1 - i));
      return {
        mes: meses[d.getMonth()],
        ventas: 0,
      };
    });

    ultimasOrdenes.forEach((orden) => {
      const mesNombre = meses[orden.createdAt.getMonth()];
      const puntoEncontrado = resultados.find((r) => r.mes === mesNombre);
      if (puntoEncontrado) {
        puntoEncontrado.ventas += orden.total * comision || 0;
      }
    });

    return resultados;
  } catch (error) {
    throw new Error("No se pudo obtener los datos para el gráfico de ventas");
  }
}

export async function generarDatosPrueba(x: number = 6) {
  try {
    const CANTIDAD_USUARIOS = 15;
    const CANTIDAD_ORDENES = 30;

    const mockUsers = await crearUsuariosFalsos(CANTIDAD_USUARIOS);

    const ordenesData = crearOrdenesFalsas(CANTIDAD_ORDENES, x, mockUsers);

    await prisma.ordenCompra.createMany({
      data: ordenesData,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    throw new Error("Hubo un problema generando los datos de prueba." + error);
  }
}

function crearOrdenesFalsas(
  cantOrdenes: number,
  x: number,
  mockUsers: { id: string; rol: RolUsuario; createdAt: Date }[],
) {
  return Array.from({ length: cantOrdenes }).map(() => {
    const fechaRandom = new Date();
    fechaRandom.setDate(1);
    const mesesAtras = Math.floor(Math.random() * x);
    fechaRandom.setMonth(fechaRandom.getMonth() - mesesAtras);
    fechaRandom.setDate(Math.floor(Math.random() * 28) + 1);

    const usuarioRandom =
      mockUsers[Math.floor(Math.random() * mockUsers.length)];

    const minCentavos = 7500000;
    const maxCentavos = 25000000;
    const totalRandom = Math.floor(
      Math.random() * (maxCentavos - minCentavos + 1) + minCentavos,
    );

    return {
      id: `mock_ord_${Math.random().toString(36).substring(7)}`,
      usuarioId: usuarioRandom.id,
      total: totalRandom,
      estado: EstadosOrden.enum.Entregado,
      createdAt: fechaRandom,
      direccionId: `mock_dir_${Math.random().toString(36).substring(7)}`,
      costoEnvio: Math.floor(Math.random() * (1500 - 500 + 1) + 500),
      operadorEnvio: "MockExpress",
      servicioEnvio: "MockStandard",
      demoraDias: Math.floor(Math.random() * (7 - 2 + 1) + 2),
    };
  });
}

async function crearUsuariosFalsos(CANTIDAD_USUARIOS: number) {
  return await Promise.all(
    Array.from({ length: CANTIDAD_USUARIOS }).map((_, i) =>
      prisma.usuario.create({
        data: {
          id: `mock_user_${Date.now()}_${i}`,
          rol: RolUsuario.USER,
        },
      }),
    ),
  );
}

export async function limpiarDatosPrueba() {
  try {
    await prisma.$transaction([
      prisma.ordenCompra.deleteMany({
        where: {
          usuarioId: { startsWith: "mock_user_" },
        },
      }),

      prisma.usuario.deleteMany({
        where: {
          id: { startsWith: "mock_user_" },
        },
      }),
    ]);

    revalidatePath("/admin");
  } catch (error) {
    throw new Error("Hubo un problema limpiando los datos de prueba.");
  }
}
