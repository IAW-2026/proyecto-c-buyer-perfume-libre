import { vendored } from "next/dist/server/route-modules/app-page/module.compiled";
import { z } from "zod";

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
  calificacion: z
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
}).transform((datos) => ({
  id: datos.id,
  nombre: datos.nombre,
  vendedor: datos.vendedor,
  imagenUrl: datos.imagenesUrl[0],
}));

// Esquemas de validacion para objetos individuales
export type Perfume = z.infer<typeof PerfumeSchema>;
export type PerfumeCard = z.infer<typeof PerfumeCardSchema>;
export type PerfumeFavorito = z.infer<typeof PerfumeFavoritoSchema>;
export type PerfumeCarrito = z.infer<typeof PerfumeCarritoSchema>;

// Esquemas de validación para arrays
export const PerfumesSchema = z.array(PerfumeSchema);
export const PerfumeCardsSchema = z.array(PerfumeCardSchema);
export const PerfumeFavoritosSchema = z.array(PerfumeFavoritoSchema);
export const PerfumeCarritosSchema = z.array(PerfumeCarritoSchema);
