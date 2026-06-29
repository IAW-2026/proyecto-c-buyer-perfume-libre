import { Button } from "@/components/ui/button";
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
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(28,21,16,0.06)]">
      <div className="p-0 flex flex-col sm:flex-row items-center sm:items-stretch">
        <ProductImagen
          imagenUrl={producto.imagenUrl}
          nombre={producto.nombre}
        />

        <div className="flex flex-col flex-1 justify-between p-5 sm:p-6 w-full">
          <ProductoDetalles
            idProducto={producto.id}
            nombreProducto={producto.nombre}
            vendedor={producto.vendedor}
            handleEliminar={onEliminar}
          />

          <div className="flex justify-between items-end mt-6">
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
    </div>
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
    <div className="relative w-full sm:w-32 shrink-0 aspect-3/4 sm:aspect-auto sm:min-h-40 overflow-hidden bg-secondary border-b sm:border-b-0 sm:border-r border-border/40">
      <Image
        src={imagenUrl}
        alt={nombre}
        fill
        sizes="(max-width: 640px) 100vw, 128px"
        className="object-cover mix-blend-multiply"
      />
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
    <div className="flex justify-between items-start gap-4">
      <div className="text-left">
        <Link href={`/producto/${url}`} className="group">
          <h3 className="font-serif text-[20px] font-normal text-foreground hover:text-accent transition-colors leading-tight">
            {nombreProducto}
          </h3>
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">
          Vendido por:{" "}
          <span className="font-semibold text-foreground/80 underline underline-offset-4 cursor-pointer hover:text-accent transition-colors">
            {vendedor}
          </span>
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground/60 hover:text-destructive hover:bg-transparent shrink-0 h-8 w-8 -mr-2 -mt-1"
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
    <div className="flex items-center border border-border/60 bg-secondary/10 rounded-sm h-9 overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-r border-border/40 text-foreground/70 hover:bg-secondary/40"
        onClick={() => handleCambiarCantidad(idProducto, cantidad - 1)}
        disabled={cantidad <= 1}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-9 text-center text-xs font-semibold text-foreground">
        {cantidad}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-l border-border/40 text-foreground/70 hover:bg-secondary/40"
        onClick={() => handleCambiarCantidad(idProducto, cantidad + 1)}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

//TODO: mover a libs
function ProductPrecio({
  precio,
  cantidad,
}: {
  precio: number;
  cantidad: number;
}) {
  return (
    <div className="text-right shrink-0">
      <span className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
        {formatearPrecio(precio * cantidad)}
      </span>
    </div>
  );
}
