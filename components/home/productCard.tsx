"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generarUrl } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  tamaño: string;
  imagenUrl: string;
}

export default function ProductCard({
  id,
  nombre,
  marca,
  precio,
  tamaño,
  imagenUrl,
}: ProductCardProps) {
  const slug = generarUrl(nombre, id);
  const urlDetalle = `/producto/${slug}`;

  const handleAgregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Agregando al carrito:", nombre);
    alert(`Click detectado`);
  };

  return (
    <Link href={urlDetalle} className="block h-full">
      <Card className="group flex h-full w-full flex-col overflow-hidden border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <ProductCardImagen imagenUrl={imagenUrl} nombre={nombre} />

        <ProductCardContenido
          marca={marca}
          nombre={nombre}
          tamaño={tamaño}
          precio={precio}
          onClick={handleAgregarAlCarrito}
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
  marca,
  nombre,
  tamaño,
  precio,
  onClick,
}: Pick<ProductCardProps, "marca" | "nombre" | "tamaño" | "precio"> & {
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <CardContent className="flex flex-1 flex-col gap-0.5 p-4 pt-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        {marca}
      </span>
      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground/90 transition-colors group-hover:text-primary">
        {nombre}
      </h3>
      <span className="text-xs text-muted-foreground">{tamaño}</span>

      <div className="mt-auto pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              ${precio.toLocaleString()}
            </span>
          </div>

          <ProductCardActions onClick={onClick} />
        </div>
      </div>
    </CardContent>
  );
}

function ProductCardActions({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <Button
      className="w-full font-semibold shadow-sm"
      size="sm"
      onClick={onClick}
    >
      Agregar al carrito
    </Button>
  );
}
