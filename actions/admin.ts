"use server";

import { currentUser } from "@clerk/nextjs/server";
import { obtenerRolUsuario } from "./usuario";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EstadoOrdenType, EstadosOrden } from "@/schema/perfume.schema";

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
      throw new Error("Usuario no autenticado");
    }

    const rolUsuario = await obtenerRolUsuario();

    if (rolUsuario.rol !== RolUsuario.ADMIN) {
      throw new Error(
        "Acceso denegado. Solo los administradores pueden acceder a esta página.",
      );
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
