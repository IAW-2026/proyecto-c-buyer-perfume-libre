"use client";

import { startTransition, useOptimistic } from "react";
import {
  actualizarCantidadEnCarrito,
  eliminarDelCarrito,
} from "@/actions/carrito";
import { ItemCarrito } from "@/schema/perfume.schema";
import CarritoVacio from "./CarritoVacio";
import ProductCardCarrito from "./productCardCarrito";
import { cn, formatearPrecio } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";

type AccionOptimista =
  | { tipo: "ELIMINAR"; id: string }
  | { tipo: "CAMBIAR_CANTIDAD"; id: string; cantidad: number };

export function CarritoWrapper({
  productosIniciales,
}: {
  productosIniciales: ItemCarrito[];
}) {
  const [optimisticProductos, dispatchOptimistic] = useOptimistic(
    productosIniciales,
    (estadoActual, accion: AccionOptimista) => {
      switch (accion.tipo) {
        case "ELIMINAR":
          return estadoActual.filter((p) => p.id !== accion.id);
        case "CAMBIAR_CANTIDAD":
          return estadoActual.map((p) =>
            p.id === accion.id ? { ...p, cantidad: accion.cantidad } : p,
          );
        default:
          return estadoActual;
      }
    },
  );

  if (optimisticProductos.length === 0) {
    return <CarritoVacio />;
  }

  const handleCambiarCantidad = async (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    startTransition(async () => {
      dispatchOptimistic({
        tipo: "CAMBIAR_CANTIDAD",
        id,
        cantidad: nuevaCantidad,
      });

      try {
        await actualizarCantidadEnCarrito(id, nuevaCantidad);
      } catch (error) {
        console.error("Fallo al actualizar", error);
      }
    });
  };

  const handleEliminar = async (id: string) => {
    startTransition(async () => {
      dispatchOptimistic({ tipo: "ELIMINAR", id });

      try {
        await eliminarDelCarrito(id);
      } catch (error) {
        console.error("Fallo al eliminar", error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 flex flex-col gap-4">
        {optimisticProductos.map((producto) => (
          <ProductCardCarrito
            key={producto.id}
            producto={producto}
            onCambiarCantidad={handleCambiarCantidad}
            onEliminar={handleEliminar}
          />
        ))}
      </div>

      <ResumenCompra productos={optimisticProductos} />
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
    <Link
      href="/checkout/envio"
      className={cn(
        buttonVariants(),
        "w-full mt-6 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-md flex items-center justify-center",
      )}
    >
      Continuar compra
    </Link>
  );
}

function calcularTotal(productos: ItemCarrito[]) {
  return productos.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
}
