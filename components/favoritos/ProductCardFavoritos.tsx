"use client";

import { formatearPrecio, generarUrl } from "@/lib/utils";
import { PerfumeFavorito } from "@/schema/perfume.schema";
import Image from "next/image";
import Link from "next/link";
import { BotonAgregarCarrito } from "../carrito/botonAgregarCarrito";
import { Trash2 } from "lucide-react";

export default function ProductoCardFavoritos({
  producto,
  onEliminar,
}: {
  producto: PerfumeFavorito;
  onEliminar: () => void;
}) {
  const onClickEliminar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEliminar();
  };

  return (
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(28,21,16,0.06)]">
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch p-0">
        <ProductImage imagenUrl={producto.imagenUrl} nombre={producto.nombre} />

        <ProductInfo
          marca={producto.marca}
          nombre={producto.nombre}
          precio={producto.precio}
          id={producto.id}
          onEliminar={onClickEliminar}
        />

        <ProductAgregarCarrito productoId={producto.id} />
      </div>
    </div>
  );
}

function ProductImage({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative w-full sm:w-40 shrink-0 aspect-3/4 sm:aspect-auto sm:min-h-45 overflow-hidden bg-secondary border-b sm:border-b-0 sm:border-r border-border/40">
      <Image
        src={imagenUrl}
        alt={nombre}
        fill
        sizes="(max-width: 640px) 100vw, 160px"
        className="object-cover mix-blend-multiply"
      />
    </div>
  );
}

function ProductInfo({
  marca,
  nombre,
  precio,
  id,
  onEliminar,
}: {
  marca: string;
  nombre: string;
  precio: number;
  id: string;
  onEliminar: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between text-center sm:text-left">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {marca}
        </span>
        <Link href={`/producto/${generarUrl(nombre, id)}`}>
          <h3 className="font-serif text-[22px] font-normal text-foreground hover:text-accent transition-colors leading-tight">
            {nombre}
          </h3>
        </Link>
        <div className="mt-2 flex flex-col">
          <span className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
            {formatearPrecio(precio)}
          </span>
        </div>
      </div>

      <ProductActions perfumeId={id} onEliminar={onEliminar} />
    </div>
  );
}

function ProductActions({
  perfumeId,
  onEliminar,
}: {
  perfumeId: string;
  onEliminar: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-4 mt-6 sm:mt-0">
      <button
        onClick={onEliminar}
        className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 outline-none"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Eliminar
      </button>

      <div className="w-px h-3 bg-border hidden sm:block" />

      <Link
        href={`/checkout/envio?productoId=${perfumeId}`}
        className="text-[11px] uppercase tracking-wider font-semibold text-foreground hover:text-accent transition-colors hidden sm:block"
      >
        Comprar ahora
      </Link>
    </div>
  );
}

function ProductAgregarCarrito({ productoId }: { productoId: string }) {
  return (
    <div className="p-5 sm:p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-border/40 shrink-0 w-full sm:w-auto">
      <BotonAgregarCarrito
        perfumeId={productoId}
        className="w-full sm:w-auto h-12 px-6 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg"
        size="default"
      />
    </div>
  );
}
