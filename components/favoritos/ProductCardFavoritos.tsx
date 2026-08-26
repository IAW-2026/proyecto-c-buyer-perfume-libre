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
      <div className="flex flex-col sm:flex-row sm:items-stretch p-0">
        <div className="flex flex-row flex-1 items-stretch">
          <ProductImage
            imagenUrl={producto.imagenUrl}
            nombre={producto.nombre}
          />

          <ProductInfo
            marca={producto.marca}
            nombre={producto.nombre}
            precio={producto.precio}
            id={producto.id}
            onEliminar={onClickEliminar}
          />
        </div>

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
    <div className="relative w-28 sm:w-40 shrink-0 min-h-35 sm:min-h-45 overflow-hidden bg-secondary border-r border-border/40">
      <Image
        src={imagenUrl}
        alt={nombre}
        fill
        sizes="(max-width: 640px) 112px, 160px"
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
    <div className="flex flex-col flex-1 p-4 sm:p-6 justify-between text-left min-w-0">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {marca}
        </span>
        <Link href={`/producto/${generarUrl(nombre, id)}`}>
          <h3 className="font-serif text-[17px] sm:text-[22px] font-normal text-foreground hover:text-accent transition-colors leading-tight line-clamp-2">
            {nombre}
          </h3>
        </Link>
        <div className="mt-1 sm:mt-2 flex flex-col">
          <span className="text-[16px] sm:text-[18px] font-semibold tracking-[-0.02em] text-foreground">
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
    <div className="flex flex-row-reverse sm:flex-row items-center justify-between sm:justify-start gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
      <div className="sm:hidden">
        <BotonAgregarCarrito
          perfumeId={perfumeId}
          className="h-8 px-3 text-[10px] uppercase font-bold rounded-sm bg-foreground text-background shadow-sm"
        />
      </div>

      <button
        onClick={onEliminar}
        className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 outline-none"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Eliminar</span>
      </button>
      <div className="w-px h-3 bg-border hidden sm:block" />

      <Link
        href={`/checkout/envio?items=${perfumeId}&directo=true`}
        className="text-[11px] uppercase tracking-wider font-semibold text-foreground hover:text-accent transition-colors hidden sm:block"
      >
        Comprar ahora
      </Link>
    </div>
  );
}

function ProductAgregarCarrito({ productoId }: { productoId: string }) {
  return (
    <div className="hidden sm:flex p-6 items-center justify-center border-l border-border/40 shrink-0 w-auto bg-transparent">
      <BotonAgregarCarrito
        perfumeId={productoId}
        className="h-12 px-6 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg"
        size="default"
      />
    </div>
  );
}
