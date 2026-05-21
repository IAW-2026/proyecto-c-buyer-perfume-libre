import Header from "@/components/header";
import { Button } from "@/components/ui/button";
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
  OrdenAgrupadaSchema,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import z from "zod";
import { obtenerComprasDelUsuario } from "@/actions/compras";
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

export function HistorialCompras({ ordenes }: { ordenes: OrdenAgrupada[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mis Compras
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisá cada orden agrupada con sus productos, fecha y estado.
          </p>
        </div>
      </div>

      {ordenes.map((orden) => (
        <div
          key={orden.ordenId}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg"
        >
          <HeaderCompra
            fecha={orden.fecha}
            estado={orden.estado}
            cantidadProductos={orden.productosComprados}
          />

          <div className="divide-y divide-slate-100">
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
    <div className="border-b border-slate-200/80 bg-linear-to-r from-slate-50 to-white px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>

          <p className="text-xs text-slate-500">
            {cantidadProductos !== 1 ? ` ${cantidadProductos} productos` : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <Badge className={COLOR_ESTADOS[estado]} variant="secondary">
            {estado}
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
    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:px-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
        <Image
          src={item.imagenUrl}
          alt={item.nombre}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DetallesProducto
          nombre={item.nombre}
          vendedor={item.vendedor}
          cantidad={item.cantidad}
        />

        <div className="flex items-center gap-3 md:shrink-0 md:justify-end">
          <Button variant="outline" size="sm" className="shrink-0">
            <Link href={`/compras/${ordenId}?itemId=${item.itemId}`}>
              Ver detalle
            </Link>
          </Button>
        </div>
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
    <div className="flex min-w-0 flex-col grow">
      <h4 className="text-base font-semibold text-slate-900 line-clamp-1">
        {nombre}
      </h4>
      <p className="mt-1 text-sm text-slate-500">
        Vendedor: <span className="font-medium">{vendedor}</span>
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
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

  return z.array(OrdenAgrupadaSchema).parse(historialAgrupado);
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
