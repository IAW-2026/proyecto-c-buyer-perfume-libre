"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatearPrecio, generarUrl } from "@/lib/utils";
import { PerfumeFavorito } from "@/schema/perfume.schema";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch">
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

          <ProductAgregarCarrito />
        </div>
      </CardContent>
    </Card>
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
    <div className="relative h-40 w-40 p-4 shrink-0 flex items-center justify-center bg-white border-r border-slate-100">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
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
    <div className="flex flex-col flex-1 p-6 justify-between text-center sm:text-left">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
          {marca}
        </span>
        <Link href={`/producto/${generarUrl(nombre, id)}`}>
          <h3 className="text-lg font-medium text-foreground hover:text-blue-600 transition-colors leading-tight">
            {nombre}
          </h3>
        </Link>
        <div className="mt-2 flex flex-col">
          <span className="text-2xl font-semibold text-foreground">
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
      <Button
        variant="link"
        className="text-blue-500 p-0 h-auto font-medium hover:text-red-600 transition-colors"
        onClick={onEliminar}
      >
        {"Eliminar"}
      </Button>
      <div className="w-px h-4 bg-slate-200 hidden sm:block" />
      <Button
        variant="link"
        className="text-blue-500 p-0 h-auto font-medium hover:text-blue-700"
      >
        Comprar ahora
      </Button>
    </div>
  );
}

function ProductAgregarCarrito() {
  return (
    <div className="p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-100">
      <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
        <ShoppingCart className="h-4 w-4" />
        Agregar al carrito
      </Button>
    </div>
  );
}
