import { z } from "zod";

// TODO: Ajustar estados segun lo que se maneje en shipping app
export const EstadosOrden = z.enum([
  "En proceso",
  "Enviado",
  "Entregado",
  "Cancelado",
]);

export type EstadoOrdenType = z.infer<typeof EstadosOrden>;

export const COLOR_ESTADOS: Record<EstadoOrdenType, string> = {
  "En proceso": "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Enviado: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Entregado: "bg-green-100 text-green-800 hover:bg-green-100",
  Cancelado: "bg-red-100 text-red-800 hover:bg-red-100",
};

// Esquemas
export const PerfumeSchema = z.object({
  id: z.string().min(1, "El ID no puede estar vacío"),
  nombre: z.string().min(1, "El nombre no puede estar vacío"),
  marca: z.string().min(1, "La marca no puede estar vacía"),
  tamaño: z
    .number()
    .int("El tamaño debe ser un número entero")
    .positive("El tamaño no puede ser negativo y debe estar en ml"),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  imagenesUrl: z
    .array(z.string().url("Debe ser una URL válida"))
    .min(1, "El perfume debe tener al menos una imagen"),
  descripcion: z.string().optional(),
  calificacion: z // TODO: Esto se deberia eliminar y remplazar por fetch a api de calificaciones
    .number()
    .min(0, "La calificación no puede ser menor a 0")
    .max(5, "La calificación no puede ser mayor a 5"),
  vendedor: z.string().min(1, "El vendedor no puede estar vacío"),
  genero: z.enum(["Hombre", "Mujer", "Unisex"]),
});

export const PerfumeCardSchema = PerfumeSchema.pick({
  id: true,
  nombre: true,
  marca: true,
  tamaño: true,
  precio: true,
  imagenesUrl: true,
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  marca: datos.marca,
  tamaño: datos.tamaño,
  precio: datos.precio,
  imagenUrl: datos.imagenesUrl[0],
}));

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

export const ItemCarritoSchema = z.intersection(
  PerfumeCarritoSchema,
  z.object({
    cantidad: z.number().int().min(1).positive(),
  }),
);

export const ItemCompradoSchema = z.intersection(
  PerfumeCompradoSchema,
  z.object({
    cantidad: z.number().int().min(1).positive(),
    fechaCompra: z.date(),
    estado: EstadosOrden,
  }),
);

export const OrdenDeCompraDbSchema = z.object({
  id: z.string(),
  estado: EstadosOrden,
  total: z.number(),
  createdAt: z.date(),
  items: z.array(
    z.object({
      id: z.string(),
      productoId: z.string(),
      precio: z.number(),
      cantidad: z.number().int().positive().min(1),
    }),
  ),
});

export const OrdenItemDetalleSchema = z.object({
  id: z.string(),
  productoId: z.string(),
  nombre: z.string(),
  vendedor: z.string(),
  imagenUrl: z.string(),
  precioHistorico: z.number(),
  cantidad: z.number().int().positive().min(1),
});

export const OrdenCompraCardSchema = z.object({
  id: z.string(),
  fecha: z.date(),
  estado: EstadosOrden,
  total: z.number(),
  items: z.array(OrdenItemDetalleSchema),
});

// Esquemas de validacion para objetos individuales
export type Perfume = z.infer<typeof PerfumeSchema>;
export type PerfumeCard = z.infer<typeof PerfumeCardSchema>;
export type PerfumeFavorito = z.infer<typeof PerfumeFavoritoSchema>;
export type PerfumeCarrito = z.infer<typeof PerfumeCarritoSchema>;
export type PerfumeComprado = z.infer<typeof PerfumeCompradoSchema>;
export type ItemCarrito = z.infer<typeof ItemCarritoSchema>;
export type ItemComprado = z.infer<typeof ItemCompradoSchema>;
export type OrdenItemDetalle = z.infer<typeof OrdenItemDetalleSchema>;
export type OrdenCompraCard = z.infer<typeof OrdenCompraCardSchema>;
export type OrdenDeCompraDb = z.infer<typeof OrdenDeCompraDbSchema>;

// Esquemas de validación para arrays
export const PerfumesSchema = z.array(PerfumeSchema);
export const PerfumeCardsSchema = z.array(PerfumeCardSchema);
export const PerfumeFavoritosSchema = z.array(PerfumeFavoritoSchema);
export const PerfumeCarritosSchema = z.array(PerfumeCarritoSchema);
export const PerfumeCompradosSchema = z.array(PerfumeCompradoSchema);
export const ItemsCarritoSchema = z.array(ItemCarritoSchema);
export const ItemsCompradosSchema = z.array(ItemCompradoSchema);
export const OrdenesDeCompraDbSchema = z.array(OrdenDeCompraDbSchema);
