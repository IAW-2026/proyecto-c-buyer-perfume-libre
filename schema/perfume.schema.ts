import { z } from "zod";

// TODO: Separar en varios esquemas según el uso que se le de.

// TODO: Ajustar estados segun lo que se maneje en shipping app
export const EstadosOrden = z.enum([
  "Pendiente",
  "Pagado",
  "En proceso",
  "Enviado",
  "Entregado",
  "Cancelado",
  "Rechazado",
  "CREADO",
  "PREPARAANDO",
  "RETIRADO",
  "ENTREGADO",
  "NO_ENTREGADO",
  "CANCELADO",
]);

export type EstadoOrdenType = z.infer<typeof EstadosOrden>;

export const COLOR_ESTADOS: Record<EstadoOrdenType, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Pagado: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  "En proceso": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Enviado: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Entregado: "bg-green-100 text-green-800 hover:bg-green-100",
  Cancelado: "bg-red-100 text-red-800 hover:bg-red-100",
  Rechazado: "bg-red-100 text-red-800 hover:bg-red-100",
  CREADO: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  PREPARAANDO: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  RETIRADO: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  ENTREGADO: "bg-green-100 text-green-800 hover:bg-green-100",
  NO_ENTREGADO: "bg-red-100 text-red-800 hover:bg-red-100",
  CANCELADO: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

// TODO: Fix rapido
export const COLOR_ESTADOS_STRING: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Pagado: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  "En proceso": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Enviado: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Entregado: "bg-green-100 text-green-800 hover:bg-green-100",
  Cancelado: "bg-red-100 text-red-800 hover:bg-red-100",
  Rechazado: "bg-red-100 text-red-800 hover:bg-red-100",
};

// Esquema principal del perfume, con toda la información detallada
export const PerfumeSchema = z.object({
  id: z.string().min(1, "El ID no puede estar vacío"),
  nombre: z.string().min(1, "El nombre no puede estar vacío"),
  marca: z.string().min(1, "La marca no puede estar vacía"),
  tamaño: z
    .number()
    .int("El tamaño debe ser un número entero")
    .positive("El tamaño no puede ser negativo y debe estar en ml"),
  precio: z.number().int().positive("El precio debe ser mayor a 0"),
  imagenesUrl: z
    .array(z.string().url("Debe ser una URL válida"))
    .min(1, "El perfume debe tener al menos una imagen"),
  descripcion: z.string().optional(),
  calificacionProducto: z
    .number()
    .min(0, "La calificación no puede ser menor a 0")
    .max(5, "La calificación no puede ser mayor a 5"),
  calificacionVendedor: z
    .number()
    .min(0, "La calificación no puede ser menor a 0")
    .max(5, "La calificación no puede ser mayor a 5"),
  vendedor: z.string().min(1, "El vendedor no puede estar vacío"),
  genero: z.enum(["Hombre", "Mujer", "Unisex"]),
});

// Esquema usado en la pag principal para mostrar los perfumes
export const PerfumeCardSchema = PerfumeSchema.pick({
  id: true,
  nombre: true,
  marca: true,
  tamaño: true,
  precio: true,
  imagenesUrl: true,
  calificacionProducto: true,
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  marca: datos.marca,
  tamaño: datos.tamaño,
  precio: datos.precio,
  imagenUrl: datos.imagenesUrl[0],
  calificacion: datos.calificacionProducto,
}));

// Esquema usado en /favoritos para mostrar los perfumes que el usuario marcó como favoritos
export const PerfumeFavoritoSchema = PerfumeSchema.pick({
  id: true,
  nombre: true,
  marca: true,
  precio: true,
  imagenesUrl: true,
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  marca: datos.marca,
  precio: datos.precio,
  imagenUrl: datos.imagenesUrl[0],
}));

// Esquema usado en /carrito para mostrar los productos que el usuario agregó al carrito
export const PerfumeCarritoSchema = PerfumeSchema.pick({
  id: true,
  nombre: true,
  vendedor: true,
  imagenesUrl: true,
  precio: true,
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  vendedor: datos.vendedor,
  imagenUrl: datos.imagenesUrl[0],
  precio: datos.precio,
}));

// Esquema usado en /compras para mostrar el historial de compras del usuario
export const PerfumeCompradoSchema = PerfumeSchema.pick({
  id: true,
  nombre: true,
  vendedor: true,
  imagenesUrl: true,
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  vendedor: datos.vendedor,
  imagenUrl: datos.imagenesUrl[0],
}));

// Esquema usado en /carrito para validar los items del carrito
export const ItemCarritoSchema = z.intersection(
  PerfumeCarritoSchema,
  z.object({
    cantidad: z.number().int().min(1).positive(),
  }),
);

// Esquema usado en /compras para validar la estructura de las ordenes de compra obtenidas desde la base de datos
export const OrdenDeCompraDbSchema = z.object({
  id: z.string(),
  estado: EstadosOrden,
  total: z.number().int().positive(),
  createdAt: z.date(),
  items: z.array(
    z.object({
      id: z.string(),
      productoId: z.string(),
      precio: z.number().int().positive(),
      cantidad: z.number().int().positive().min(1),
    }),
  ),
});

// Esquema usado en /compras para mostrar el historial de compras del usuario
export const ItemOrdenDetalleSchema = z.object({
  itemId: z.string(),
  productoId: z.string(),
  nombre: z.string(),
  vendedor: z.string(),
  imagenUrl: z.string(),
  precioHistorico: z.number().int().positive(),
  cantidad: z.number().int().positive().min(1),
});

// Esquema usado en /compras para mostrar el historial de compras del usuario, agrupando por orden de compra
export const OrdenAgrupadaSchema = z.object({
  ordenId: z.string(),
  fecha: z.date(),
  estado: EstadosOrden,
  productosComprados: z.number().int().positive().min(1),
  items: z.array(ItemOrdenDetalleSchema),
});

export const ItemDeOrdenDetalladoSchema = z.object({
  idItem: z.string(),
  ordenCompraId: z.string(),
  productoId: z.string(),
  precio: z.number().int().positive(),
  cantidad: z.number().int().positive().min(1),
  nombreProducto: z.string(),
  vendedor: z.string(),
  imagenUrl: z.string(),
  marca: z.string(),
  tamaño: z.number().int().positive(),
  historialEnvio: z.array(
    z.object({
      fecha: z.string(),
      ubicacion: z.string(),
    }),
  ),

  ordenCompra: z.object({
    usuarioId: z.string(),
    pagoId: z.string().nullable(),
    envioId: z.string().nullable(),
    estado: EstadosOrden,
    costoEnvio: z.number().int().min(0),
    total: z.number().int().positive(),
    itemsComprados: z.number().int().positive().min(1),
    createdAt: z.date(),
    vendedorId: z.string(),
  }),
});

// Esquemas de validacion para objetos individuales
export type Perfume = z.infer<typeof PerfumeSchema>;
export type PerfumeCard = z.infer<typeof PerfumeCardSchema>;
export type PerfumeFavorito = z.infer<typeof PerfumeFavoritoSchema>;
export type PerfumeCarrito = z.infer<typeof PerfumeCarritoSchema>;
export type PerfumeComprado = z.infer<typeof PerfumeCompradoSchema>;
export type ItemCarrito = z.infer<typeof ItemCarritoSchema>;
export type OrdenDeCompraDb = z.infer<typeof OrdenDeCompraDbSchema>;
export type itemsDeOrdenDb = z.infer<typeof OrdenDeCompraDbSchema.shape.items>;
export type ItemOrdenDetalle = z.infer<typeof ItemOrdenDetalleSchema>;
export type OrdenAgrupada = z.infer<typeof OrdenAgrupadaSchema>;
export type ItemDeOrdenDetallado = z.infer<typeof ItemDeOrdenDetalladoSchema>;

// Esquemas de validación para arrays
export const PerfumesSchema = z.array(PerfumeSchema);
export const PerfumeCardsSchema = z.array(PerfumeCardSchema);
export const PerfumeFavoritosSchema = z.array(PerfumeFavoritoSchema);
export const PerfumeCarritosSchema = z.array(PerfumeCarritoSchema);
export const PerfumeCompradosSchema = z.array(PerfumeCompradoSchema);
export const ItemsCarritoSchema = z.array(ItemCarritoSchema);
export const OrdenesDeCompraDbSchema = z.array(OrdenDeCompraDbSchema);
