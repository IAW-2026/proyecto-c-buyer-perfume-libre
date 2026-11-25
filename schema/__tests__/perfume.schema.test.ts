import { describe, it, expect } from "vitest";
import {
  PerfumeSchema,
  PerfumeCardSchema,
  ItemCarritoSchema,
  EstadosOrden,
  OrdenDeCompraDbSchema,
} from "../perfume.schema";

describe("schema/perfume.schema.ts - Validación y contratos de dominio", () => {
  const perfumeValido = {
    id: "perfume-123",
    nombre: "Sauvage Eau de Parfum",
    marca: "Dior",
    tamaño: 100,
    precio: 185000,
    imagenesUrl: ["https://example.com/sauvage-1.jpg", "https://example.com/sauvage-2.jpg"],
    descripcion: "Perfume aromático fougère para hombre",
    calificacionProducto: 4.8,
    calificacionVendedor: 4.9,
    vendedor: "Fragrance Official",
    genero: "Hombre" as const,
  };

  describe("PerfumeSchema", () => {
    it("valida exitosamente un perfume completo y consistente", () => {
      const res = PerfumeSchema.safeParse(perfumeValido);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.id).toBe("perfume-123");
        expect(res.data.precio).toBe(185000);
      }
    });

    it("rechaza si faltan campos obligatorios o vienen strings vacíos", () => {
      const sinNombre = { ...perfumeValido, nombre: "" };
      expect(PerfumeSchema.safeParse(sinNombre).success).toBe(false);

      const sinMarca = { ...perfumeValido, marca: "" };
      expect(PerfumeSchema.safeParse(sinMarca).success).toBe(false);

      const sinVendedor = { ...perfumeValido, vendedor: "" };
      expect(PerfumeSchema.safeParse(sinVendedor).success).toBe(false);
    });

    it("rechaza precios negativos, cero o no enteros", () => {
      expect(PerfumeSchema.safeParse({ ...perfumeValido, precio: 0 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, precio: -500 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, precio: 1500.5 }).success).toBe(false);
    });

    it("rechaza tamaños negativos, cero o decimales", () => {
      expect(PerfumeSchema.safeParse({ ...perfumeValido, tamaño: 0 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, tamaño: -100 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, tamaño: 99.5 }).success).toBe(false);
    });

    it("rechaza calificaciones fuera del rango [0, 5]", () => {
      expect(PerfumeSchema.safeParse({ ...perfumeValido, calificacionProducto: -0.1 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, calificacionProducto: 5.1 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, calificacionVendedor: -1 }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, calificacionVendedor: 6 }).success).toBe(false);
    });

    it("exige al menos una imagen y que las URLs sean válidas", () => {
      expect(PerfumeSchema.safeParse({ ...perfumeValido, imagenesUrl: [] }).success).toBe(false);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, imagenesUrl: ["no-es-una-url"] }).success).toBe(false);
    });

    it("valida géneros permitidos ('Hombre', 'Mujer', 'Unisex')", () => {
      expect(PerfumeSchema.safeParse({ ...perfumeValido, genero: "Unisex" }).success).toBe(true);
      expect(PerfumeSchema.safeParse({ ...perfumeValido, genero: "Mujer" }).success).toBe(true);
      // Género no contemplado en el enum del esquema
      expect(PerfumeSchema.safeParse({ ...perfumeValido, genero: "Niños" }).success).toBe(false);
    });
  });

  describe("PerfumeCardSchema (Transformación)", () => {
    it("transforma correctamente extrayendo imagenUrl principal y calificacion", () => {
      const res = PerfumeCardSchema.safeParse(perfumeValido);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.imagenUrl).toBe("https://example.com/sauvage-1.jpg");
        expect(res.data.calificacion).toBe(4.8);
        // Verifica que no arrastra campos que no van a la tarjeta
        expect("descripcion" in res.data).toBe(false);
        expect("genero" in res.data).toBe(false);
      }
    });
  });

  describe("ItemCarritoSchema", () => {
    const itemCarritoValido = {
      id: "perfume-123",
      nombre: "Sauvage",
      vendedor: "Seller Oficial",
      imagenesUrl: ["https://example.com/sauvage.jpg"],
      precio: 185000,
      cantidad: 2,
    };

    it("valida un ítem de carrito con cantidad positiva entera", () => {
      const res = ItemCarritoSchema.safeParse(itemCarritoValido);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.cantidad).toBe(2);
        expect(res.data.imagenUrl).toBe("https://example.com/sauvage.jpg");
      }
    });

    it("rechaza cantidades menores a 1, cero o con decimales", () => {
      expect(ItemCarritoSchema.safeParse({ ...itemCarritoValido, cantidad: 0 }).success).toBe(false);
      expect(ItemCarritoSchema.safeParse({ ...itemCarritoValido, cantidad: -1 }).success).toBe(false);
      expect(ItemCarritoSchema.safeParse({ ...itemCarritoValido, cantidad: 1.5 }).success).toBe(false);
    });
  });

  describe("EstadosOrden Enum", () => {
    it("acepta todos los estados oficiales de la máquina de estados", () => {
      const estadosValidos = [
        "PENDIENTE",
        "PAGADO",
        "PREPARANDO",
        "EN_TRANSITO",
        "ENTREGADO",
        "CANCELADO",
      ];
      for (const estado of estadosValidos) {
        expect(EstadosOrden.safeParse(estado).success).toBe(true);
      }
    });

    it("rechaza estados arbitrarios o en minúsculas", () => {
      expect(EstadosOrden.safeParse("pendiente").success).toBe(false);
      expect(EstadosOrden.safeParse("EN_PROCESO").success).toBe(false);
      expect(EstadosOrden.safeParse("RECHAZADO").success).toBe(false);
    });
  });

  describe("OrdenDeCompraDbSchema", () => {
    it("valida una orden de compra persistida con sus items y snapshots", () => {
      const orden = {
        id: "orden-uuid-1",
        estado: "PAGADO",
        total: 370000,
        createdAt: new Date(),
        items: [
          {
            id: "item-1",
            productoId: "perfume-123",
            precio: 185000,
            cantidad: 2,
            nombre: "Sauvage",
            marca: "Dior",
            imagenUrl: "https://example.com/img.jpg",
            vendedor: "Seller Oficial",
          },
        ],
      };

      const res = OrdenDeCompraDbSchema.safeParse(orden);
      expect(res.success).toBe(true);
    });

    it("rechaza órdenes con total negativo o cero", () => {
      const ordenInvalida = {
        id: "orden-uuid-2",
        estado: "PENDIENTE",
        total: 0,
        createdAt: new Date(),
        items: [],
      };
      expect(OrdenDeCompraDbSchema.safeParse(ordenInvalida).success).toBe(false);
    });
  });
});
