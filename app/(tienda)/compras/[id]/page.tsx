import {
  obtenerCantidadDeProductosComprados,
  obtenerItemDeOrden,
} from "@/actions/compras";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatearPrecio } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { EstadosOrden, ItemDeOrdenDetallado } from "@/schema/perfume.schema";
import { format } from "date-fns/format";
import { es } from "date-fns/locale";
import { ArrowLeft, Calendar, CreditCard, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { obtenerDetallePerfume, obtenerHistorialEnvio } from "@/lib/api";
import { SeccionResenas } from "@/components/compras/SeccionResenas";
import { SimuladorEnvio } from "@/components/compras/SelectorEnvio";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ itemId?: string }>;
};

export const metadata = {
  title: "Detalle de la Compra - Perfume Libre",
  description: "Revisa el detalle de tu compra realizada en Perfume Libre",
};

export default async function DetalleCompraPage({
  params,
  searchParams,
}: Props) {
  const { id: ordenId } = await params;
  const { itemId } = await searchParams;

  if (!itemId) notFound();

  const orden = await obtenerItemOrden(ordenId, itemId);

  if (!orden) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <DetalleCompra orden={orden} />
      </main>
    </div>
  );
}

function DetalleCompra({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Link
          href="/compras"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-[11px] uppercase tracking-[0.08em] font-bold text-muted-foreground hover:text-foreground -ml-4 transition-colors",
          )}
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Volver al historial
        </Link>

        <SimuladorEnvio ordenId={orden.ordenCompraId} itemId={orden.idItem} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-[clamp(28px,4vw,36px)] font-normal text-foreground leading-[1.1] tracking-tight">
            Detalle del Pedido
          </h1>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
            <p>
              Orden{" "}
              <span className="text-foreground">
                #{orden.ordenCompraId.slice(0, 8)}
              </span>
            </p>
            <span className="hidden sm:inline text-border">|</span>
            <p>
              Item{" "}
              <span className="text-foreground">
                #{orden.idItem.slice(0, 8)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <PanelPrincipal orden={orden} />
    </div>
  );
}

function PanelPrincipal({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <CardSeguimiento orden={orden} />

        <ResumenProductoComprado orden={orden} />

        {orden.ordenCompra.estado === "Entregado" && (
          <SeccionResenas
            productoId={orden.productoId}
            nombreProducto={orden.nombreProducto}
            vendedor={orden.vendedor}
            usuarioId={orden.ordenCompra.usuarioId}
          />
        )}
      </div>

      <ResumenPago orden={orden} />
    </div>
  );
}

function CardSeguimiento({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <Card className="overflow-hidden rounded-sm border-border/60 shadow-sm">
      <CardHeader className="bg-secondary/30 pb-4 border-b border-border/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5 text-foreground">
            <Truck className="h-4 w-4" />
            <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-bold">
              Seguimiento del Envío
            </CardTitle>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            TRK: {orden.ordenCompra.envioId}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="mb-8 flex items-center gap-2">
          <p className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground">
            Estado actual:
          </p>
          <span className="text-[12px] uppercase tracking-wider font-bold text-accent">
            {orden.ordenCompra.estado}
          </span>
        </div>

        <HistorialEnvio historialEnvio={orden.historialEnvio} />
      </CardContent>
    </Card>
  );
}

function HistorialEnvio({
  historialEnvio,
}: {
  historialEnvio: { fecha: string; ubicacion: string }[];
}) {
  return (
    <div className="border-l border-border/80 ml-2 pl-8 space-y-8 relative">
      {historialEnvio.map((evento, idx) => (
        <div key={idx} className="relative">
          <span
            className={`absolute -left-9.25 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card ${
              idx === 0 ? "bg-accent" : "bg-border"
            }`}
          />
          <p
            className={`text-[14px] leading-none ${
              idx === 0
                ? "font-semibold text-foreground"
                : "font-light text-muted-foreground"
            }`}
          >
            {evento.ubicacion}
          </p>
          <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-wide">
            {evento.fecha}
          </p>
        </div>
      ))}
    </div>
  );
}

function ResumenProductoComprado({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <Card className="rounded-sm border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground">
          Detalle del Producto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-5 items-center">
          <div className="relative w-16 sm:w-20 shrink-0 aspect-3/4 bg-secondary rounded-sm border border-border/40 overflow-hidden">
            <Image
              src={orden.imagenUrl}
              alt={orden.nombreProducto}
              fill
              sizes="80px"
              className="object-cover mix-blend-multiply"
            />
          </div>

          <div className="grow min-w-0">
            <h4 className="font-serif text-[20px] text-foreground line-clamp-1">
              {orden.nombreProducto}
            </h4>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">
              Vendedor:{" "}
              <span className="font-semibold text-foreground/80">
                {orden.vendedor}
              </span>
            </p>
            <p className="text-[12px] font-medium text-foreground mt-3">
              {orden.cantidad} {orden.cantidad > 1 ? "unidades" : "unidad"}{" "}
              <span className="mx-2 text-border">|</span>{" "}
              {formatearPrecio(orden.precio)} c/u
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResumenPago({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-sm border-border/60 shadow-sm sticky top-24">
        <CardHeader className="bg-secondary/30 pb-4 border-b border-border/60">
          <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground">
            Resumen de costos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between text-[13px] font-light text-muted-foreground">
            <span>
              {orden.ordenCompra.itemsComprados > 1
                ? `Productos (${orden.ordenCompra.itemsComprados})`
                : "Producto (1)"}
            </span>
            <span className="font-medium text-foreground">
              {formatearPrecio(
                orden.ordenCompra.total - orden.ordenCompra.costoEnvio,
              )}
            </span>
          </div>

          <div className="flex justify-between text-[13px] font-light text-muted-foreground">
            <span>Envío</span>
            {orden.ordenCompra.costoEnvio > 0 ? (
              <span className="font-medium text-foreground">
                {formatearPrecio(orden.ordenCompra.costoEnvio)}
              </span>
            ) : (
              <span className="text-accent font-bold uppercase tracking-wider text-[11px]">
                Gratis
              </span>
            )}
          </div>

          <Separator className="my-4 border-border/60" />

          <div className="flex justify-between items-baseline">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
              Total pagado
            </span>
            <span className="font-light text-[24px] text-foreground">
              {formatearPrecio(orden.ordenCompra.total)}
            </span>
          </div>

          <Separator className="my-4 border-border/60" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {format(orden.ordenCompra.createdAt, "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="truncate">
                ID Pago:{" "}
                <span className="font-semibold text-foreground/80">
                  {orden.ordenCompra.pagoId}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function obtenerItemOrden(
  ordenId: string,
  itemId: string,
): Promise<ItemDeOrdenDetallado | null> {
  const [ordenDb, itemsComprados] = await Promise.all([
    obtenerItemDeOrden(ordenId, itemId),
    obtenerCantidadDeProductosComprados(ordenId),
  ]);

  if (!ordenDb) {
    return null;
  }

  const [productoDetalle, datosEnvio] = await Promise.all([
    obtenerDetallePerfume(ordenDb.productoId),
    obtenerHistorialEnvio(ordenDb.ordenCompra.estado),
  ]);

  if (!productoDetalle) {
    return null;
  }

  const estadoValidado = EstadosOrden.parse(datosEnvio.estadoActual);
  const { id: idItem, ...restoDeOrdenDb } = ordenDb;

  return {
    ...restoDeOrdenDb,
    idItem,
    ordenCompra: {
      ...ordenDb.ordenCompra,
      estado: estadoValidado,
      itemsComprados: itemsComprados || 1,
    },
    historialEnvio: datosEnvio.historial,
    nombreProducto: productoDetalle.nombre,
    vendedor: productoDetalle.vendedor,
    imagenUrl: productoDetalle.imagenesUrl[0],
    marca: productoDetalle.marca,
    tamaño: productoDetalle.tamaño,
  };
}
