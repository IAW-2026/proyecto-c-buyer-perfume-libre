import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { obtenerProductosComprados } from "@/lib/api";
import {
  COLOR_ESTADOS,
  EstadoOrdenType,
  ItemOrdenDetalle,
  OrdenAgrupada,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import z from "zod";
import { obtenerComprasDelUsuario } from "@/actions/compras";
import { es } from "date-fns/locale";
import { cn, obtenerLabelEstado } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis Compras - Perfume Libre",
  description: "Historial de compras del usuario",
};

export default async function MisComprasPage() {
  const itemsComprados = await obtenerHistorialDelUsuario();

  return (
    <div className="w-full bg-background flex flex-col flex-1">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex flex-col flex-1">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground shrink-0">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Mis Compras</span>
        </nav>

        {itemsComprados ? (
          <HistorialCompras ordenes={itemsComprados} />
        ) : (
          <div className="flex flex-1 items-center justify-center pb-8 md:pb-12">
            <EstadoVacioCompras />
          </div>
        )}
      </main>
    </div>
  );
}

function EstadoVacioCompras() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-sm border border-border/60 bg-card px-6 py-16 md:py-24 text-center shadow-sm">
      <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal text-foreground mb-3 tracking-tight">
        Aún no tienes compras
      </h2>
      <p className="mx-auto max-w-md text-[14px] font-light text-muted-foreground leading-relaxed">
        Cuando realices tu primera adquisición, aquí podrás hacer el seguimiento
        y ver el detalle de cada pedido.
      </p>
      <div className="mt-8">
        <Link
          href="/?page=1"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-12 px-8 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md",
          )}
        >
          Explorar fragancias
        </Link>
      </div>
    </div>
  );
}

export function HistorialCompras({ ordenes }: { ordenes: OrdenAgrupada[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[clamp(28px,4vw,36px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
          Historial de Pedidos
        </h1>
        <p className="mt-2 text-[14px] font-light text-muted-foreground">
          Revisa el estado y detalle de tus adquisiciones recientes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {ordenes.map((orden) => (
          <div
            key={orden.ordenId}
            className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(28,21,16,0.06)]"
          >
            <HeaderCompra
              fecha={orden.fecha}
              estado={orden.estado}
              cantidadProductos={orden.productosComprados}
            />

            <div className="divide-y divide-border/40">
              {orden.items.map((item) => (
                <ProductoCompra
                  key={item.itemId}
                  item={item}
                  ordenId={orden.ordenId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeaderCompra({
  fecha,
  estado,
  cantidadProductos,
}: {
  fecha: Date;
  estado: EstadoOrdenType;
  cantidadProductos: number;
}) {
  return (
    <div className="border-b border-border/60 bg-secondary/30 px-4 sm:px-5 py-3 sm:py-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">
            {format(fecha, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <span className="hidden sm:inline text-border/60">|</span>
          <p className="text-[10px] sm:text-[12px] font-light text-muted-foreground mt-0.5 sm:mt-0">
            {cantidadProductos}{" "}
            {cantidadProductos === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div>
          <Badge
            className={cn(
              COLOR_ESTADOS[estado],
              "uppercase tracking-widest font-bold text-[9px] rounded-sm px-2 py-1 sm:px-2.5",
            )}
            variant="secondary"
          >
            {obtenerLabelEstado(estado)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ProductoCompra({
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

function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): OrdenAgrupada[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialAgrupado: OrdenAgrupada[] = compradoDb.map((orden) => {
    const itemsProcesados: ItemOrdenDetalle[] = orden.items.map((item) => {
      const detalleCatálogo = detallesMap.get(item.productoId);
      return {
        itemId: item.id,
        productoId: item.productoId,
        nombre: detalleCatálogo?.nombre ?? "Producto no disponible",
        vendedor: detalleCatálogo?.vendedor ?? "Desconocido",
        imagenUrl: detalleCatálogo?.imagenUrl ?? "/placeholder-perfume.jpg",
        precioHistorico: item.precio,
        cantidad: item.cantidad,
      };
    });

    const productosComprados = orden.items.reduce(
      (acc, item) => acc + item.cantidad,
      0,
    );

    return {
      ordenId: orden.id,
      fecha: orden.createdAt,
      estado: orden.estado,
      items: itemsProcesados,
      productosComprados: productosComprados,
    };
  });

  return historialAgrupado;
}

async function obtenerHistorialDelUsuario() {
  const obtenerComprasDb = await obtenerComprasDelUsuario();

  const obtenerComprasDbValidado = z
    .array(OrdenDeCompraDbSchema)
    .parse(obtenerComprasDb);

  if (obtenerComprasDbValidado.length === 0) {
    return null;
  }

  const perfumesCompradosId = obtenerIdComprados(obtenerComprasDbValidado);

  const detallePerfumesComprados =
    await obtenerProductosComprados(perfumesCompradosId);

  return fusionarCompradoConDetalles(
    obtenerComprasDbValidado,
    detallePerfumesComprados,
  );
}

function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
