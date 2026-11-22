"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { EstadoOrden, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EstadoOrdenType, EstadosOrden } from "@/schema/perfume.schema";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { rethrowIfNavigationError } from "@/lib/errors/navigation-guard";

const EstadosOrdenInactivas: EstadoOrdenType[] = [
  EstadosOrden.enum.PENDIENTE,
  EstadosOrden.enum.CANCELADO,
];

// Simulación de comisión del 10%
const comision = 0.1;

export async function obtenerAdminPageData() {
  await requireAdmin();
  try {
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
    rethrowIfNavigationError(error);
    console.error("Error en obtenerAdminPageData:", error);
    return null;
  }
}

async function calcularGanancias() {
  try {
    const totalGanancia = await prisma.ordenCompra.aggregate({
      _sum: { total: true },
    });

    const gananciaNeta = (totalGanancia._sum.total || 0) * comision;

    return gananciaNeta;
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    throw new Error("No se pudo obtener los datos para el gráfico de ventas");
  }
}

interface FiltrosOrdenes {
  q?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}

export async function obtenerOrdenes(filtros?: FiltrosOrdenes) {
  await requireAdmin();
  try {
    const whereClause: Prisma.OrdenCompraWhereInput = {};

    if (filtros?.q) {
      whereClause.id = {
        contains: filtros.q,
        mode: "insensitive",
      };
    }

    if (filtros?.estado && filtros.estado !== "todos") {
      whereClause.estado = filtros.estado as EstadoOrden;
    }

    const limit = Math.min(Math.max(1, filtros?.limit ?? 50), 100);
    const offset = Math.max(0, filtros?.offset ?? 0);

    const ordenes = await prisma.ordenCompra.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    return ordenes;
  } catch (error) {
    console.error(error);
    throw new Error("No se pudieron obtener las órdenes");
  }
}

export async function obtenerOrdenPorId(ordenId: string) {
  await requireAdmin();
  try {
    const orden = await prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      include: {
        items: true,
      },
    });

    if (!orden) {
      return { orden: null, direccion: null };
    }

    const direccion = await prisma.direccion.findUnique({
      where: { id: orden?.direccionId },
      select: {
        localidad: true,
        provincia: true,
        codigoPostal: true,
        telefono: true,
      },
    });

    return { orden, direccion };
  } catch (error) {
    console.error(error);
    throw new Error("No se pudo obtener la orden");
  }
}

export async function obtenerDatosUsuario(usuarioId: string) {
  await requireAdmin();
  try {
    const client = await clerkClient();

    const usuarioClerk = await client.users.getUser(usuarioId);

    if (!usuarioClerk) {
      throw new Error(
        "El usuario no fue encontrado en los registros de autenticación.",
      );
    }

    const email = usuarioClerk.emailAddresses[0]?.emailAddress;
    const nombreCompleto =
      `${usuarioClerk.firstName ?? ""} ${usuarioClerk.lastName ?? ""}`.trim();

    return { email, nombreCompleto };
  } catch (error) {
    console.error("Error al obtener datos del usuario desde Clerk:", error);
    return { email: "Desconocido", nombreCompleto: "Usuario Desconocido" };
  }
}

export async function actualizarEstadoOrdenAdmin(
  ordenId: string,
  nuevoEstado: EstadoOrden,
) {
  await requireAdmin();
  try {
    await prisma.ordenCompra.update({
      where: { id: ordenId },
      data: { estado: nuevoEstado },
    });

    revalidatePath(`/admin/ordenes/${ordenId}`);
    revalidatePath("/admin/ordenes");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "No se pudo actualizar el estado" };
  }
}

export async function obtenerUsuarios() {
  await requireAdmin();
  try {
    const client = await clerkClient();
    const response = await client.users.getUserList();

    return response.data.map((user) => ({
      id: user.id,
      nombre:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Sin nombre",
      email: user.emailAddresses[0]?.emailAddress || "Sin email",
      imagenUrl: user.imageUrl,
      fechaRegistro: user.createdAt,
      estaBaneado: user.banned,
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

export async function alternarEstadoUsuario(
  usuarioId: string,
  estaBaneado: boolean,
) {
  await requireAdmin();
  try {
    const client = await clerkClient();

    if (estaBaneado) {
      await client.users.unbanUser(usuarioId);
    } else {
      await client.users.banUser(usuarioId);
    }

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return {
      success: false,
      error: "No se pudo modificar el acceso del usuario.",
    };
  }
}
