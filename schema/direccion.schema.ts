import { z } from "zod";

export const DireccionDbSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  provincia: z.string(),
  codigoPostal: z.string(),
  localidad: z.string(),
  calle: z.string(),
  altura: z.string(),
  pisoDepto: z.string().nullish(),
  telefono: z.string(),
  nombreDestinatario: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DireccionSchema = z.object({
  calle: z.string().min(1, "La dirección es requerida"),
  altura: z.string().min(1).regex(/^\d+$/, "La altura debe ser un número"),
  codigoPostal: z.string().regex(/^\d{4}$/, "El CP debe tener 4 dígitos"),
  localidad: z.string().min(2, "La localidad es requerida"),
  provincia: z.string().min(2, "La provincia es requerida"),
  telefono: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^[0-9+\s-]+$/, "Formato de teléfono inválido"),
  nombreDestinatario: z
    .string()
    .min(2, "El nombre del destinatario es requerido"),
  pisoDepto: z.string().optional(),
});

export type DireccionDb = z.infer<typeof DireccionDbSchema>;
export type Direccion = z.infer<typeof DireccionSchema>;
