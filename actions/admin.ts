"use server";

import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
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

    revalidatePath("/admin/dashboard");
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

    revalidatePath("/admin/dashboard");
  } catch (error) {
    throw new Error("Hubo un problema limpiando los datos de prueba.");
  }
}

interface FiltrosOrdenes {
  q?: string;
  estado?: string;
}

export async function obtenerOrdenes(filtros?: FiltrosOrdenes) {
  try {
    const whereClause: any = {};

    if (filtros?.q) {
      whereClause.id = {
        contains: filtros.q,
        mode: "insensitive",
      };
    }

    if (filtros?.estado && filtros.estado !== "todos") {
      whereClause.estado = filtros.estado;
    }

    const ordenes = await prisma.ordenCompra.findMany({
      where: whereClause,
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
  nuevoEstado: string,
) {
  try {
    // Validamos que el estado enviado pertenezca a los enums permitidos
    const estadoValido = EstadosOrden.safeParse(nuevoEstado);
    if (!estadoValido.success) {
      throw new Error("Estado de orden no válido");
    }

    await prisma.ordenCompra.update({
      where: { id: ordenId },
      data: { estado: nuevoEstado as any },
    });

    // Revalidamos la ruta para que la UI muestre el cambio de inmediato
    revalidatePath(`/admin/ordenes/${ordenId}`);
    revalidatePath("/admin/ordenes");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "No se pudo actualizar el estado" };
  }
}

export async function obtenerUsuarios() {
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
