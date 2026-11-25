import { describe, it, expect } from "vitest";
import {
  pesosACentavos,
  centavosAPesos,
  formatearPrecio,
  obtenerComision,
} from "../money";

describe("lib/money.ts - Utilidades monetarias puras", () => {
  describe("pesosACentavos", () => {
    it("convierte números enteros de pesos a centavos", () => {
      expect(pesosACentavos(1)).toBe(100);
      expect(pesosACentavos(100)).toBe(10000);
      expect(pesosACentavos(5500)).toBe(550000);
    });

    it("maneja correctamente decimales evitando imprecisiones de punto flotante de JS", () => {
      // En JS puro: 19.99 * 100 = 1998.9999999999998
      expect(pesosACentavos(19.99)).toBe(1999);
      expect(pesosACentavos(0.01)).toBe(1);
      expect(pesosACentavos(0.1)).toBe(10);
      expect(pesosACentavos(99.95)).toBe(9995);
      expect(pesosACentavos(1234.56)).toBe(123456);
    });

    it("acepta valores numéricos en formato string", () => {
      expect(pesosACentavos("100")).toBe(10000);
      expect(pesosACentavos("19.99")).toBe(1999);
      expect(pesosACentavos("0.05")).toBe(5);
    });

    it("maneja el valor cero", () => {
      expect(pesosACentavos(0)).toBe(0);
      expect(pesosACentavos("0")).toBe(0);
    });

    it("redondea fracciones menores a un centavo al entero más cercano", () => {
      // 10.004 pesos -> 1000.4 centavos -> 1000
      expect(pesosACentavos(10.004)).toBe(1000);
      // 10.006 pesos -> 1000.6 centavos -> 1001
      expect(pesosACentavos(10.006)).toBe(1001);
    });
  });

  describe("centavosAPesos", () => {
    it("convierte centavos a pesos decimales", () => {
      expect(centavosAPesos(100)).toBe(1);
      expect(centavosAPesos(10000)).toBe(100);
      expect(centavosAPesos(1999)).toBe(19.99);
      expect(centavosAPesos(1)).toBe(0.01);
      expect(centavosAPesos(50)).toBe(0.5);
      expect(centavosAPesos(0)).toBe(0);
    });

    it("cumple la propiedad inversa con pesosACentavos para valores de 2 decimales", () => {
      const valores = [1, 10.5, 99.99, 1500.25, 0.05];
      for (const val of valores) {
        expect(centavosAPesos(pesosACentavos(val))).toBeCloseTo(val, 2);
      }
    });
  });

  describe("formatearPrecio", () => {
    // Normaliza espacios (incluye non-breaking spaces que introduce Intl.NumberFormat)
    const normalizarEspacios = (str: string) => str.replace(/\u00A0/g, " ").trim();

    it("formatea el monto en formato de moneda argentina (ARS / $)", () => {
      // 10000 centavos = 100 pesos -> "$ 100" o "$100"
      const formateado = normalizarEspacios(formatearPrecio(10000));
      expect(formateado).toContain("$");
      expect(formateado).toContain("100");
    });

    it("multiplica por la cantidad si se especifica", () => {
      // 10000 centavos (100 pesos) * 3 unidades = 300 pesos
      const formateado = normalizarEspacios(formatearPrecio(10000, 3));
      expect(formateado).toContain("$");
      expect(formateado).toContain("300");
    });

    it("aplica separador de miles para montos grandes sin mostrar centavos decimales", () => {
      // 150000000 centavos = 1.500.000 pesos
      const formateado = normalizarEspacios(formatearPrecio(150000000));
      expect(formateado).toContain("1.500.000");
      expect(formateado).toContain("$");
    });

    it("formatea cero pesos correctamente", () => {
      const formateado = normalizarEspacios(formatearPrecio(0));
      expect(formateado).toContain("$");
      expect(formateado).toContain("0");
    });
  });

  describe("obtenerComision", () => {
    it("calcula exactamente el 10% del monto en pesos", () => {
      expect(obtenerComision(100)).toBe(10);
      expect(obtenerComision(1000)).toBe(100);
      expect(obtenerComision(250)).toBe(25);
    });

    it("redondea enteros ante resultados con decimales", () => {
      // 155 * 0.1 = 15.5 -> 16
      expect(obtenerComision(155)).toBe(16);
      // 9 * 0.1 = 0.9 -> 1
      expect(obtenerComision(9)).toBe(1);
      // 4 * 0.1 = 0.4 -> 0
      expect(obtenerComision(4)).toBe(0);
    });

    it("retorna cero para un monto de cero pesos", () => {
      expect(obtenerComision(0)).toBe(0);
    });
  });
});
