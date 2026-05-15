import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generarUrl, formatearPrecio } from "@/lib/utils";
import { ItemCarrito } from "@/schema/perfume.schema";
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function productCardCarrito({
  producto,
  onCambiarCantidad,
  onEliminar,
}: {
  producto: ItemCarrito;
  onCambiarCantidad: (id: string, cant: number) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4 md:gap-6">
          <ProductImagen
            imagenUrl={producto.imagenUrl}
            nombre={producto.nombre}
          />

          <div className="flex flex-col flex-1 justify-between py-1">
            <ProductoDetalles
              idProducto={producto.id}
              nombreProducto={producto.nombre}
              vendedor={producto.vendedor}
              handleEliminar={onEliminar}
            />

            <div className="flex justify-between items-end mt-4">
              <SelectorDeCantidad
                idProducto={producto.id}
                cantidad={producto.cantidad}
                handleCambiarCantidad={onCambiarCantidad}
              />
              <ProductPrecio
                precio={producto.precio}
                cantidad={producto.cantidad}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductImagen({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 border rounded-md overflow-hidden bg-white">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
    </div>
  );
}

function ProductoDetalles({
  idProducto,
  nombreProducto,
  vendedor,
  handleEliminar,
}: {
  idProducto: string;
  nombreProducto: string;
  vendedor: string;
  handleEliminar: (id: string) => void;
}) {
  const url = generarUrl(nombreProducto, idProducto);

  return (
    <div className="flex justify-between items-start gap-2">
      <div>
        <Link
          href={`/producto/${url}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="font-medium text-sm md:text-base leading-tight">
            {nombreProducto}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          Vendido por <span className="text-blue-500">{vendedor}</span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => handleEliminar(idProducto)}
        aria-label="Eliminar producto del carrito"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SelectorDeCantidad({
  idProducto,
  cantidad,
  handleCambiarCantidad,
}: {
  idProducto: string;
  cantidad: number;
  handleCambiarCantidad: (id: string, cant: number) => void;
}) {
  return (
    <div className="flex items-center border rounded-md h-9">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-r"
        onClick={() => handleCambiarCantidad(idProducto, cantidad - 1)}
        disabled={cantidad <= 1}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-10 text-center text-sm font-medium">{cantidad}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-l"
        onClick={() => handleCambiarCantidad(idProducto, cantidad + 1)}
        aria-label="aumentar cantidad"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ProductPrecio({
  precio,
  cantidad,
}: {
  precio: number;
  cantidad: number;
}) {
  return (
    <div className="text-right">
      <span className="text-lg md:text-xl font-semibold">
        {formatearPrecio(precio, cantidad)}
      </span>
    </div>
  );
}
