import { describe, it, expect } from "vitest";
import { calcularTotalProductos, obtenerLabelEstado } from "../order-utils";
import { EstadosOrden } from "@/schema/perfume.schema";

describe("lib/order-utils.ts - Utilidades de órdenes y estados", () => {
  describe("calcularTotalProductos", () => {
    it("retorna 0 si la lista de items está vacía", () => {
      const total = calcularTotalProductos([]);
      expect(total).toBe(0);
    });

    it("calcula el total de un solo ítem con cantidad 1", () => {
      const items = [
        {
          id: "item-1",
          productoId: "prod-1",
          precio: 25000,
          cantidad: 1,
        },
      ];
      expect(calcularTotalProductos(items)).toBe(25000);
    });

    it("calcula el total ponderando cantidad * precio por ítem", () => {
      const items = [
        {
          id: "item-1",
          productoId: "prod-1",
          precio: 15000,
          cantidad: 3, // 45000
        },
        {
          id: "item-2",
          productoId: "prod-2",
          precio: 30000,
          cantidad: 2, // 60000
        },
      ];
      expect(calcularTotalProductos(items)).toBe(105000);
    });

    it("soporta items con metadatos descriptivos opcionales (snapshot)", () => {
      const items = [
        {
          id: "item-1",
          productoId: "prod-1",
          precio: 12000,
          cantidad: 2,
          nombre: "Acqua Di Gio",
          marca: "Giorgio Armani",
          imagenUrl: "https://example.com/img.jpg",
          vendedor: "Seller Central",
        },
      ];
      expect(calcularTotalProductos(items)).toBe(24000);
    });
  });

  describe("obtenerLabelEstado", () => {
    it("mapea exhaustivamente cada estado del enum EstadosOrden a su etiqueta en español", () => {
      expect(obtenerLabelEstado(EstadosOrden.enum.PENDIENTE)).toBe("Pendiente de Pago");
      expect(obtenerLabelEstado(EstadosOrden.enum.PAGADO)).toBe("Pagado");
      expect(obtenerLabelEstado(EstadosOrden.enum.PREPARANDO)).toBe("En Preparación");
      expect(obtenerLabelEstado(EstadosOrden.enum.EN_TRANSITO)).toBe("En Camino");
      expect(obtenerLabelEstado(EstadosOrden.enum.ENTREGADO)).toBe("Entregado");
      expect(obtenerLabelEstado(EstadosOrden.enum.CANCELADO)).toBe("Cancelado");
    });

    it("retorna el mismo valor como fallback ante un estado inesperado", () => {
      // @ts-expect-error probando valor arbitrario no contemplado en el enum
      expect(obtenerLabelEstado("DESCONOCIDO")).toBe("DESCONOCIDO");
    });
  });
});
