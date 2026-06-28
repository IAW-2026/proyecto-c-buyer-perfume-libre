"use client";

import { startTransition, useOptimistic, useState, useMemo } from "react";
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
import { CheckCircle2, Circle, ShoppingBag } from "lucide-react";

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

  // Agrupar por vendedor
  const vendedores = useMemo(() => {
    const mapa = new Map<string, ItemCarrito[]>();
    for (const prod of optimisticProductos) {
      const grupo = mapa.get(prod.vendedor) ?? [];
      grupo.push(prod);
      mapa.set(prod.vendedor, grupo);
    }
    return mapa;
  }, [optimisticProductos]);

  const nombresVendedores = Array.from(vendedores.keys());
  const hayMultiplesVendedores = nombresVendedores.length > 1;

  // Vendedor seleccionado: si hay uno solo, ya está seleccionado
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<string>(
    hayMultiplesVendedores ? "" : (nombresVendedores[0] ?? ""),
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

  const productosSeleccionados = vendedorSeleccionado
    ? (vendedores.get(vendedorSeleccionado) ?? [])
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
      <div className="lg:col-span-8 flex flex-col gap-8">
        {hayMultiplesVendedores && (
          <AvisoMultiplesVendedores count={nombresVendedores.length} />
        )}

        {nombresVendedores.map((vendedor) => {
          const productos = vendedores.get(vendedor) ?? [];
          const seleccionado = vendedorSeleccionado === vendedor;

          return (
            <GrupoVendedor
              key={vendedor}
              vendedor={vendedor}
              productos={productos}
              seleccionado={seleccionado}
              seleccionable={hayMultiplesVendedores}
              onSeleccionar={() => setVendedorSeleccionado(vendedor)}
              onCambiarCantidad={handleCambiarCantidad}
              onEliminar={handleEliminar}
            />
          );
        })}
      </div>

      <ResumenCompra
        productos={productosSeleccionados}
        vendedorSeleccionado={vendedorSeleccionado}
        hayMultiplesVendedores={hayMultiplesVendedores}
      />
    </div>
  );
}

// ─── Aviso ────────────────────────────────────────────────────────────────────

function AvisoMultiplesVendedores({ count }: { count: number }) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400">
      <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Tenés productos de{" "}
        <span className="font-semibold">{count} vendedores distintos</span>.
        Solo podés comprarle a un vendedor por orden. Seleccioná el grupo con el
        que querés continuar.
      </p>
    </div>
  );
}

// ─── Grupo por vendedor ───────────────────────────────────────────────────────

function GrupoVendedor({
  vendedor,
  productos,
  seleccionado,
  seleccionable,
  onSeleccionar,
  onCambiarCantidad,
  onEliminar,
}: {
  vendedor: string;
  productos: ItemCarrito[];
  seleccionado: boolean;
  seleccionable: boolean;
  onSeleccionar: () => void;
  onCambiarCantidad: (id: string, cant: number) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border transition-all duration-200",
        seleccionable && seleccionado
          ? "border-foreground/30 shadow-sm"
          : seleccionable
            ? "border-border/50 opacity-60 hover:opacity-80"
            : "border-border/50",
      )}
    >
      {/* Header del grupo */}
      <button
        type="button"
        onClick={seleccionable ? onSeleccionar : undefined}
        disabled={!seleccionable}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3.5 border-b border-border/40",
          seleccionable
            ? "cursor-pointer hover:bg-secondary/20 transition-colors"
            : "cursor-default",
        )}
        aria-pressed={seleccionable ? seleccionado : undefined}
      >
        <div className="flex items-center gap-2.5">
          {seleccionable &&
            (seleccionado ? (
              <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            ))}
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-foreground">
            {vendedor}
          </span>
          <span className="text-[11px] text-muted-foreground font-normal">
            · {productos.length}{" "}
            {productos.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        {seleccionable && (
          <span
            className={cn(
              "text-[11px] font-medium transition-colors",
              seleccionado ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {seleccionado ? "Seleccionado" : "Seleccionar"}
          </span>
        )}
      </button>

      {/* Productos */}
      <div className="flex flex-col gap-0 divide-y divide-border/30">
        {productos.map((producto) => (
          <div key={producto.id} className="p-4 sm:p-5">
            <ProductCardCarrito
              producto={producto}
              onCambiarCantidad={onCambiarCantidad}
              onEliminar={onEliminar}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

function ResumenCompra({
  productos,
  vendedorSeleccionado,
  hayMultiplesVendedores,
}: {
  productos: ItemCarrito[];
  vendedorSeleccionado: string;
  hayMultiplesVendedores: boolean;
}) {
  const total = calcularTotal(productos);
  const puedeComprar = !!vendedorSeleccionado && productos.length > 0;

  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-24 rounded-sm border border-border/60 bg-card shadow-sm h-fit">
        <div className="p-6">
          <h2 className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground mb-5">
            Resumen de compra
          </h2>

          <div className="space-y-4">
            {puedeComprar ? (
              <ResumenProductos productos={productos} />
            ) : (
              <p className="text-[12px] text-muted-foreground">
                Seleccioná un vendedor para ver el resumen.
              </p>
            )}

            <Separator className="my-4 border-border/60" />

            <ResumenTotal total={total} mostrar={puedeComprar} />

            <BotonContinuarCompra
              productos={productos}
              habilitado={puedeComprar}
              hayMultiplesVendedores={hayMultiplesVendedores}
            />
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
          </span>
        </div>
      ))}
    </div>
  );
}

function ResumenTotal({ total, mostrar }: { total: number; mostrar: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
        Subtotal
      </span>
      <span className="font-light tracking-[-0.02em] text-[24px] text-foreground">
        {mostrar ? formatearPrecio(total) : "—"}
      </span>
    </div>
  );
}

function BotonContinuarCompra({
  productos,
  habilitado,
  hayMultiplesVendedores,
}: {
  productos: ItemCarrito[];
  habilitado: boolean;
  hayMultiplesVendedores: boolean;
}) {
  const href = useMemo(() => {
    if (!habilitado) return "#";
    const ids = productos.map((p) => p.id).join(",");
    return `/checkout/envio?items=${ids}`;
  }, [habilitado, productos]);

  return (
    <Link
      href={href}
      aria-disabled={!habilitado}
      tabIndex={habilitado ? undefined : -1}
      className={cn(
        buttonVariants({ variant: "default" }),
        "w-full mt-6 h-14 text-[13px] uppercase tracking-wider font-semibold transition-all rounded-sm shadow-md flex items-center justify-center",
        habilitado
          ? "bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg"
          : "pointer-events-none bg-muted text-muted-foreground shadow-none",
      )}
    >
      {hayMultiplesVendedores && !habilitado
        ? "Seleccioná un vendedor"
        : "Continuar compra"}
    </Link>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function calcularTotal(productos: ItemCarrito[]) {
  return productos.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
}
