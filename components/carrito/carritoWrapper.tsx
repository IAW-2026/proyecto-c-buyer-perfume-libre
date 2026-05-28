"use client";

import { useEffect, useState } from "react";
import { ItemCarrito } from "@/schema/perfume.schema";
import {
  actualizarCantidadEnCarrito,
  eliminarDelCarrito,
} from "@/actions/carrito";
import { formatearPrecio } from "@/lib/utils";
import ProductCardCarrito from "./productCardCarrito";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/dist/client/link";

export function CarritoWrapper({
  productosIniciales,
}: {
  productosIniciales: ItemCarrito[];
}) {
  const [productos, setProductos] = useState<ItemCarrito[]>(productosIniciales);

  const handleCambiarCantidad = async (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    const estadoAnterior = [...productos];

    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: nuevaCantidad } : p)),
    );
    try {
      await actualizarCantidadEnCarrito(id, nuevaCantidad);
    } catch (error) {
      console.error("Fallo al actualizar", error);
      setProductos(estadoAnterior);
    }
  };

  const handleEliminar = async (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));

    try {
      await eliminarDelCarrito(id);
    } catch (error) {
      console.error("Fallo al eliminar", error);
      setProductos(productosIniciales);
    }
  };

  useEffect(() => {
    setProductos(productosIniciales);
  }, [productosIniciales]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 flex flex-col gap-4">
        {productos.map((producto) => (
          <ProductCardCarrito
            key={producto.id}
            producto={producto}
            onCambiarCantidad={handleCambiarCantidad}
            onEliminar={handleEliminar}
          />
        ))}
      </div>

      <ResumenCompra productos={productos} />
    </div>
  );
}

function ResumenCompra({ productos }: { productos: ItemCarrito[] }) {
  const total = calcularTotal(productos);

  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-24 border-none shadow-sm h-fit">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Resumen de compra</h2>

          <div className="space-y-3">
            <ResumenProductos productos={productos} />

            <Separator className="my-4" />

            <ResumenTotal total={total} />

            <BotonContinuarCompra productos={productos} total={total} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ResumenProductos({ productos }: { productos: ItemCarrito[] }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {productos.map((prod) => (
        <div className="flex justify-between items-start gap-2" key={prod.id}>
          <span>{`${prod.nombre} `}</span>
          <span>{formatearPrecio(prod.precio, prod.cantidad)}</span>{" "}
        </div>
      ))}
    </div>
  );
}

function ResumenTotal({ total }: { total: number }) {
  return (
    <div className="flex justify-between text-lg font-bold">
      <span>Subtotal</span>
      <span>{formatearPrecio(total)}</span>
    </div>
  );
}

function BotonContinuarCompra({
  productos,
  total,
}: {
  productos: ItemCarrito[];
  total: number;
}) {
  return (
    <Link href={`/checkout/envio`}>
      <Button className="w-full mt-6 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
        Continuar compra
      </Button>
    </Link>
  );
}

function calcularTotal(productos: ItemCarrito[]) {
  return productos.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
}
