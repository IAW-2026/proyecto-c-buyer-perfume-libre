import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatearPrecio, generarUrl } from "@/lib/utils";
import { PerfumeCard } from "@/schema/perfume.schema";
import CalificacionEstrellas from "../calificacionEstrellas";

export default function ProductCard({
  id,
  nombre,
  marca,
  precio,
  tamaño,
  imagenUrl,
  calificacion,
}: PerfumeCard) {
  const slug = generarUrl(nombre, id);
  const urlDetalle = `/producto/${slug}`;

  return (
    <Link href={urlDetalle} className="block h-full outline-none">
      <Card className="group flex h-full w-full flex-col overflow-hidden border border-border bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(28,21,16,0.13)]">
        <ProductCardImagen imagenUrl={imagenUrl} nombre={nombre} />

        <ProductCardContenido
          id={id}
          marca={marca}
          nombre={nombre}
          tamaño={tamaño}
          precio={precio}
          calificacion={calificacion}
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
    <div className="relative aspect-3/4 overflow-hidden bg-secondary">
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
  precio,
  calificacion,
}: Pick<
  PerfumeCard,
  "id" | "marca" | "nombre" | "tamaño" | "precio" | "calificacion"
>) {
  return (
    <CardContent className="flex flex-1 flex-col p-4.5">
      <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {marca}
      </span>

      <h3 className="mb-2 text-[16px] font-medium leading-[1.3] tracking-[-0.01em] text-foreground">
        {nombre}
      </h3>

      <div className="mb-2.5 flex items-center gap-1.5">
        <CalificacionEstrellas rating={calificacion} />
      </div>

      <div className="mt-auto pt-1">
        <div className="flex flex-col">
          <span className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">
            {formatearPrecio(precio)}
          </span>
        </div>
      </div>
    </CardContent>
  );
}
