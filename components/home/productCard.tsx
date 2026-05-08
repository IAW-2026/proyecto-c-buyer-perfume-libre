import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Definimos qué datos necesita nuestra tarjeta para existir
interface ProductCardProps {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  tamaño: string;
  imagenUrl: string;
}

export default function ProductCard({
  nombre,
  marca,
  precio,
  tamaño,
  imagenUrl,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col transition-all hover:shadow-md cursor-pointer group">
      <ProductCardImage imagenUrl={imagenUrl} nombre={nombre} />

      <ProductCardContenido
        marca={marca}
        nombre={nombre}
        tamaño={tamaño}
        precio={precio}
      />

      <ProductCardFooter />
    </Card>
  );
}

function ProductCardImage({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative aspect-square bg-white flex items-center justify-center p-4">
      <div className="relative w-full h-full">
        <Image
          src={imagenUrl}
          alt={`Perfume ${nombre}`}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}

function ProductCardContenido({
  marca,
  nombre,
  tamaño,
  precio,
}: Pick<ProductCardProps, "marca" | "nombre" | "tamaño" | "precio">) {
  return (
    <CardContent className="flex flex-1 flex-col border-t p-4 gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {marca}
      </span>
      <h3 className="text-sm font-normal leading-tight line-clamp-2">
        {nombre}
      </h3>
      <span className="-mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {tamaño}
      </span>

      <div className="mt-2 flex flex-col">
        <span className="text-2xl font-medium tracking-tight">
          ${precio.toLocaleString()}
        </span>
      </div>
    </CardContent>
  );
}

function ProductCardFooter() {
  return (
    <CardFooter className="p-3 pt-3">
      <Button className="w-full font-semibold" variant="default">
        Agregar al carrito
      </Button>
    </CardFooter>
  );
}
