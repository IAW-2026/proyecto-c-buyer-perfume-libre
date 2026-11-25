import { describe, it, expect } from "vitest";
import { DireccionSchema, DireccionDbSchema } from "../direccion.schema";

describe("schema/direccion.schema.ts - Esquemas de validación de direcciones", () => {
  const direccionValida = {
    calle: "Av. Corrientes",
    altura: "1234",
    codigoPostal: "1043",
    localidad: "San Nicolás",
    provincia: "Buenos Aires",
    telefono: "+54 11 4321-8765",
    nombreDestinatario: "Juan Pérez",
    pisoDepto: "4B",
  };

  describe("DireccionSchema (Input de usuario)", () => {
    it("valida correctamente una dirección completa", () => {
      const res = DireccionSchema.safeParse(direccionValida);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.calle).toBe("Av. Corrientes");
        expect(res.data.altura).toBe("1234");
        expect(res.data.pisoDepto).toBe("4B");
      }
    });

    it("permite direcciones sin pisoDepto (campo opcional)", () => {
      const { pisoDepto: _, ...sinDepto } = direccionValida;
      const res = DireccionSchema.safeParse(sinDepto);
      expect(res.success).toBe(true);
    });

    it("exige que la altura sea estrictamente numérica", () => {
      expect(DireccionSchema.safeParse({ ...direccionValida, altura: "123A" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, altura: "s/n" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, altura: "" }).success).toBe(false);
    });

    it("valida que el código postal tenga exactamente 4 dígitos", () => {
      expect(DireccionSchema.safeParse({ ...direccionValida, codigoPostal: "123" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, codigoPostal: "12345" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, codigoPostal: "C1043" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, codigoPostal: "abcd" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, codigoPostal: "1043" }).success).toBe(true);
    });

    it("valida formato y longitud mínima de teléfono (al menos 8 caracteres)", () => {
      expect(DireccionSchema.safeParse({ ...direccionValida, telefono: "1234567" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, telefono: "11234567" }).success).toBe(true);
      expect(DireccionSchema.safeParse({ ...direccionValida, telefono: "+54 9 11 1234-5678" }).success).toBe(true);
      // Caracteres alfabéticos inválidos en teléfono
      expect(DireccionSchema.safeParse({ ...direccionValida, telefono: "11234567abc" }).success).toBe(false);
    });

    it("exige longitud mínima en destinatario, localidad y provincia", () => {
      expect(DireccionSchema.safeParse({ ...direccionValida, nombreDestinatario: "A" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, localidad: "B" }).success).toBe(false);
      expect(DireccionSchema.safeParse({ ...direccionValida, provincia: "C" }).success).toBe(false);
    });
  });

  describe("DireccionDbSchema (Registro en Base de Datos)", () => {
    it("valida un registro completo de dirección con IDs y fechas de auditoría", () => {
      const registroDb = {
        id: "dir-uuid-1",
        usuarioId: "user_clerk_123",
        provincia: "Buenos Aires",
        codigoPostal: "1043",
        localidad: "San Nicolás",
        calle: "Av. Corrientes",
        altura: "1234",
        pisoDepto: null,
        telefono: "+54 11 4321-8765",
        nombreDestinatario: "Juan Pérez",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const res = DireccionDbSchema.safeParse(registroDb);
      expect(res.success).toBe(true);
    });

    it("rechaza si falta el usuarioId o id del registro", () => {
      const incompleto = {
        provincia: "Buenos Aires",
        codigoPostal: "1043",
        localidad: "San Nicolás",
        calle: "Av. Corrientes",
        altura: "1234",
        telefono: "+54 11 4321-8765",
        nombreDestinatario: "Juan Pérez",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(DireccionDbSchema.safeParse(incompleto).success).toBe(false);
    });
  });
});
