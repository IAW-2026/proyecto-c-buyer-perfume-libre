"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatearPrecio, generarUrl } from "@/lib/utils";
import { PerfumeCard } from "@/schema/perfume.schema";
import { BotonAgregarCarrito } from "../carrito/botonAgregarCarrito";

export default function ProductCard({
  id,
  nombre,
  marca,
  precio,
  tamaño,
  imagenUrl,
}: PerfumeCard) {
  const slug = generarUrl(nombre, id);
  const urlDetalle = `/producto/${slug}`;

  return (
    <Link href={urlDetalle} className="block h-full">
      <Card className="group flex h-full w-full flex-col overflow-hidden border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <ProductCardImagen imagenUrl={imagenUrl} nombre={nombre} />

        <ProductCardContenido
          id={id}
          marca={marca}
          nombre={nombre}
          tamaño={tamaño}
          precio={precio}
        />
      </Card>
    </Link>
  );
}

function ProductCardImagen({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative aspect-square overflow-hidden bg-muted/5">
      <Image
        src={imagenUrl}
        alt={`Perfume ${nombre}`}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

function ProductCardContenido({
  id,
  marca,
  nombre,
  tamaño,
  precio,
}: Pick<PerfumeCard, "id" | "marca" | "nombre" | "tamaño" | "precio">) {
  return (
    <CardContent className="flex flex-1 flex-col gap-0.5 p-4 pt-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        {marca}
      </span>
      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground/90 transition-colors group-hover:text-primary">
        {nombre}
      </h3>
      <span className="text-xs text-muted-foreground">{`${tamaño} ml`}</span>

      <div className="mt-auto pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatearPrecio(precio)}
            </span>
          </div>

          <BotonAgregarCarrito
            perfumeId={id}
            className="w-full font-semibold shadow-sm"
            size="sm"
          />
        </div>
      </div>
    </CardContent>
  );
}
