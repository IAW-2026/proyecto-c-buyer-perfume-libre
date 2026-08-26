import { ItemOrdenDetalle } from "@/schema/perfume.schema";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function ProductoCompra({
  item,
  ordenId,
}: {
  item: ItemOrdenDetalle;
  ordenId: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 gap-4 sm:gap-5">
      <div className="flex flex-row flex-1 items-stretch gap-4 min-w-0">
        <div className="relative w-20 shrink-0 min-h-26.5 overflow-hidden rounded-sm bg-secondary border border-border/40">
          <Image
            src={item.imagenUrl}
            alt={item.nombre}
            fill
            sizes="80px"
            className="object-cover mix-blend-multiply"
          />
        </div>

        <DetallesProducto
          nombre={item.nombre}
          vendedor={item.vendedor}
          cantidad={item.cantidad}
        />
      </div>

      <div className="shrink-0 pt-3 sm:pt-0 border-t border-border/40 sm:border-transparent mt-1 sm:mt-0">
        <Link
          href={`/compras/${ordenId}?itemId=${item.itemId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 px-5 text-[10px] uppercase tracking-widest font-bold border border-border/60 bg-transparent text-foreground hover:bg-secondary/20 hover:text-accent hover:border-accent/40 transition-all rounded-sm w-full sm:w-auto flex items-center justify-center",
          )}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

function DetallesProducto({
  nombre,
  vendedor,
  cantidad,
}: {
  nombre: string;
  vendedor: string;
  cantidad: number;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center grow">
      <h4 className="font-serif text-[16px] sm:text-[20px] font-normal text-foreground line-clamp-2 sm:line-clamp-1 leading-tight">
        {nombre}
      </h4>
      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Vendedor:{" "}
        <span className="font-semibold text-foreground/80 truncate block sm:inline">
          {vendedor}
        </span>
      </p>
      <p className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {cantidad > 1 ? `Unidades: ${cantidad}` : `Unidad: ${cantidad}`}
      </p>
    </div>
  );
}
