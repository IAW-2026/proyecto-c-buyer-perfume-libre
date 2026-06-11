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
import { buttonVariants } from "../ui/button";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
      <div className="lg:col-span-8 flex flex-col gap-5">
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
      <Card className="sticky top-24 rounded-sm border border-border/60 bg-card shadow-sm h-fit">
        <div className="p-6">
          <h2 className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground mb-5">
            Resumen de compra
          </h2>

          <div className="space-y-4">
            <ResumenProductos productos={productos} />

            <Separator className="my-4 border-border/60" />

            <ResumenTotal total={total} />

            <BotonContinuarCompra />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ResumenProductos({ productos }: { productos: ItemCarrito[] }) {
  return (
    <div className="flex flex-col gap-2.5 text-[13px] font-light text-muted-foreground">
      {productos.map((prod) => (
        <div className="flex justify-between items-start gap-3" key={prod.id}>
          <span className="truncate">
            {prod.nombre}{" "}
            <span className="text-[11px] opacity-60">({prod.cantidad})</span>
          </span>
          <span className="font-medium text-foreground shrink-0">
            {formatearPrecio(prod.precio * prod.cantidad)}
          </span>{" "}
        </div>
      ))}
    </div>
  );
}

function ResumenTotal({ total }: { total: number }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
        Subtotal
      </span>
      <span className="font-light tracking-[-0.02em] text-[24px] text-foreground">
        {formatearPrecio(total)}
      </span>
    </div>
  );
}

function BotonContinuarCompra() {
  return (
    <Link
      href="/checkout/envio"
      className={cn(
        buttonVariants({ variant: "default" }),
        "w-full mt-6 h-14 text-[13px] uppercase tracking-wider font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all rounded-sm shadow-md hover:shadow-lg flex items-center justify-center",
      )}
    >
      Continuar compra
    </Link>
  );
}

// TODO: Mover a libs
function calcularTotal(productos: ItemCarrito[]) {
  return productos.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
}
