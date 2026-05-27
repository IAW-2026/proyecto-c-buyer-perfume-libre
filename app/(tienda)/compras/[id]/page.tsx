import {
  obtenerCantidadDeProductosComprados,
  obtenerItemDeOrden,
  simularCambioEstado,
} from "@/actions/compras";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatearPrecio } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { EstadosOrden, ItemDeOrdenDetallado } from "@/schema/perfume.schema";
import { format } from "date-fns/format";
import { es } from "date-fns/locale";
import { ArrowLeft, Calendar, CreditCard, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { obtenerDetallePerfume, obtenerHistorialEnvio } from "@/lib/api";
import { SeccionResenas } from "@/components/compras/SeccionResenas";
import { Badge } from "@/components/ui/badge";
import { SimuladorEnvio } from "@/components/compras/SelectorEnvio";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ itemId?: string }>;
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
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<p>Cargando detalles de la compra...</p>}>
          <div className="min-h-screen bg-slate-50/50">
            <DetalleCompra orden={orden} />
          </div>
        </Suspense>
      </main>
    </div>
  );
}

function DetalleCompra({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" className="text-slate-600 -ml-2">
          <Link href="/compras">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Link>
        </Button>

        <SimuladorEnvio ordenId={orden.ordenCompraId} itemId={orden.idItem} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Detalle de la Compra
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Orden #{orden.ordenCompraId.toUpperCase()}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            item #{orden.idItem.toUpperCase()}
          </p>
        </div>
      </div>

      <PanelPrincipal orden={orden} />
    </div>
  );
}

function PanelPrincipal({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <CardSeguimiento orden={orden} />

        <ProductCard orden={orden} />

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
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="bg-slate-50/50 pb-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700">
            <Truck className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base font-semibold">
              Seguimiento del Envío
            </CardTitle>
          </div>
          <span className="text-xs font-mono text-slate-500">
            TRK: {orden.ordenCompra.envioId}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-900">
            Estado actual:{" "}
            <span className="text-blue-600">{orden.ordenCompra.estado}</span>
          </p>
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
    <div className="border-l-2 border-blue-100 ml-2 pl-6 space-y-6 relative">
      {historialEnvio.map((evento: any, idx: number) => (
        <div key={idx} className="relative">
          <span
            className={`absolute -left-7.25 top-1 h-3 w-3 rounded-full ring-4 ring-white ${
              idx === 0 ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
          <p
            className={`text-sm ${idx === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}
          >
            {evento.ubicacion}
          </p>
          <p className="text-xs text-slate-400 mt-1">{evento.fecha}</p>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ orden }: { orden: ItemDeOrdenDetallado }) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Detalle del Producto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="relative h-20 w-20 shrink-0 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
            <Image
              src={orden.imagenUrl}
              alt={orden.nombreProducto}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="grow min-w-0">
            <h4 className="font-medium text-slate-900 line-clamp-1">
              {orden.nombreProducto}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Vendedor:{" "}
              <span className="font-medium text-slate-700">
                {orden.vendedor}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {orden.cantidad} u. <span className="mx-2 text-slate-300">|</span>{" "}
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
      <Card className="border-slate-200/80 shadow-sm sticky top-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Resumen de costos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              {orden.ordenCompra.itemsComprados > 1
                ? `productos (${orden.ordenCompra.itemsComprados})`
                : "producto"}
            </span>
            <span>
              {formatearPrecio(
                orden.ordenCompra.total - orden.ordenCompra.costoEnvio,
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm text-slate-600">
            <span>Envío</span>
            {orden.ordenCompra.costoEnvio > 0 ? (
              <span>{formatearPrecio(orden.ordenCompra.costoEnvio)}</span>
            ) : (
              <span className="text-green-600 font-medium">Gratis</span>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-baseline">
            <span className="font-bold text-slate-900">Total pagado</span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatearPrecio(orden.ordenCompra.total)}
            </span>
          </div>

          <Separator className="my-2" />

          {/* DETALLES DE TRANSACCIÓN */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Comprado el{" "}
                {format(
                  orden.ordenCompra.createdAt,
                  "d 'de' MMMM, yyyy HH:mm",
                  {
                    locale: es,
                  },
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">
                ID de Pago:{" "}
                <span className="font-mono">{orden.ordenCompra.pagoId}</span>
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
  const ordenDb = await obtenerItemDeOrden(ordenId, itemId);
  const itemsComprados = await obtenerCantidadDeProductosComprados(ordenId);

  if (!ordenDb) {
    return null;
  }

  const productoDetalle = await obtenerDetallePerfume(ordenDb.productoId);

  if (!productoDetalle) {
    return null;
  }

  const datosEnvio = await obtenerHistorialEnvio(ordenDb.ordenCompra.estado);
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
