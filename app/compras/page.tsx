import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { obtenerProductosComprados } from "@/lib/api";
import {
  COLOR_ESTADOS,
  EstadosOrden,
  OrdenCompraCard,
  OrdenCompraCardSchema,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import z from "zod";
import { obtenerComprasDelUsuario } from "@/actions/compras";
import { formatearPrecio } from "@/lib/utils";
import { es } from "date-fns/locale";
import { Suspense } from "react";

export default async function MisComprasPage() {
  const itemsComprados = await obtenerHistorialDelUsuario();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/*TODO: Implementar skeleton*/}
        <Suspense fallback={<p>Cargando historial de compras...</p>}>
          {itemsComprados ? (
            <HistorialCompras ordenes={itemsComprados} />
          ) : (
            <EstadoVacioCompras />
          )}
        </Suspense>
      </main>
    </div>
  );
}

function EstadoVacioCompras() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <span className="text-lg font-semibold">0</span>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        Todavía no tienes compras
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Cuando hagas tu primera compra, vas a ver acá el historial con el
        detalle de cada pedido.
      </p>
      <div className="mt-6 flex justify-center">
        <Button variant="outline">
          <Link href="/">Explorar perfumes</Link>
        </Button>
      </div>
    </div>
  );
}

export function HistorialCompras({ ordenes }: { ordenes: OrdenCompraCard[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-8">Mis Compras</h1>
      {ordenes.map((orden) => (
        <div
          key={orden.id}
          className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
          <HeaderOrden orden={orden} />

          <ListaProductos orden={orden} />

          <FooterAcciones ordenId={orden.id} />
        </div>
      ))}
    </div>
  );
}

function HeaderOrden({ orden }: { orden: OrdenCompraCard }) {
  return (
    <div className="bg-slate-50 border-b p-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {format(orden.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <Badge className={COLOR_ESTADOS[orden.estado]} variant="secondary">
          {orden.estado}
        </Badge>
      </div>
    </div>
  );
}

function ListaProductos({ orden }: { orden: OrdenCompraCard }) {
  return (
    <div className="p-4 md:px-6 divide-y">
      {orden.items.map((item) => (
        <div
          key={item.id}
          className="py-4 first:pt-2 last:pb-2 flex gap-4 items-center"
        >
          <div className="relative h-20 w-20 shrink-0 bg-slate-100 rounded-md border overflow-hidden">
            <Image
              src={item.imagenUrl}
              alt={item.nombre}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <DetallesProducto
            nombre={item.nombre}
            vendedor={item.vendedor}
            cantidad={item.cantidad}
            precioHistorico={item.precioHistorico}
            imagenUrl={item.imagenUrl}
          />
        </div>
      ))}
    </div>
  );
}

function DetallesProducto({
  nombre,
  vendedor,
  cantidad,
  precioHistorico,
  imagenUrl,
}: {
  nombre: string;
  vendedor: string;
  cantidad: number;
  precioHistorico: number;
  imagenUrl: string;
}) {
  return (
    <div className="flex flex-col grow">
      <h4 className="text-base font-medium text-slate-900 line-clamp-1">
        {nombre}
      </h4>
      <p className="text-sm text-slate-500 mt-1">
        Vendedor: <span className="font-medium">{vendedor}</span>
      </p>
      <p className="text-sm text-slate-500 mt-0.5">
        Cantidad: {cantidad}
        <span className="mx-2 text-slate-300">|</span>
        {formatearPrecio(precioHistorico)} c/u
      </p>
    </div>
  );
}

function FooterAcciones({ ordenId }: { ordenId: string }) {
  return (
    <div className="border-t p-4 md:px-6 flex justify-end bg-white">
      <Button variant="outline">
        <Link href={`/compras/${ordenId}`}>Ver detalle de la compra</Link>
      </Button>
    </div>
  );
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

function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): OrdenCompraCard[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialFusionado = compradoDb.map((orden) => {
    return {
      id: orden.id,
      fecha: orden.createdAt,
      estado: orden.estado,
      total: orden.total,
      items: orden.items.map((item) => {
        const detalleCatálogo = detallesMap.get(item.productoId);

        return {
          id: item.id,
          productoId: item.productoId,
          nombre: detalleCatálogo?.nombre,
          vendedor: detalleCatálogo?.vendedor,
          imagenUrl: detalleCatálogo?.imagenUrl,
          precioHistorico: item.precio,
          cantidad: item.cantidad,
        };
      }),
    };
  });

  return z.array(OrdenCompraCardSchema).parse(historialFusionado);
}

function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
