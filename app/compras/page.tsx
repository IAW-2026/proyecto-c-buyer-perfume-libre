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
  ItemOrdenDetalleSchema,
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
            <HistorialCompras items={itemsComprados} />
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

export function HistorialCompras({ items }: { items: ItemOrdenDetalle[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-8">Mis Compras</h1>

      {items.map((item) => (
        <div
          key={item.itemId}
          className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
        >
          <HeaderCompra fecha={item.fecha} estado={item.estado} />

          <ProductoCompra item={item} />
        </div>
      ))}
    </div>
  );
}

function HeaderCompra({
  fecha,
  estado,
}: {
  fecha: Date;
  estado: EstadoOrdenType;
}) {
  return (
    <div className="bg-slate-50/50 border-b p-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <Badge className={COLOR_ESTADOS[estado]} variant="secondary">
          {estado}
        </Badge>
      </div>
    </div>
  );
}

function ProductoCompra({ item }: { item: ItemOrdenDetalle }) {
  return (
    <div className="p-4 md:px-6 flex gap-4 items-center">
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
      />

      <Button variant="outline" size="sm" className="ml-auto shrink-0">
        <Link href={`/compras/${item.ordenId}?itemId=${item.itemId}`}>
          Ver detalle de la compra
        </Link>
      </Button>
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
    <div className="flex flex-col grow">
      <h4 className="text-base font-medium text-slate-900 line-clamp-1">
        {nombre}
      </h4>
      <p className="text-sm text-slate-500 mt-1">
        Vendedor: <span className="font-medium">{vendedor}</span>
      </p>
      <p className="text-sm text-slate-500 mt-0.5">
        {cantidad > 1 ? `Unidades: ${cantidad}` : `Unidad: ${cantidad}`}
      </p>
    </div>
  );
}

function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): ItemOrdenDetalle[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialPlano = compradoDb.flatMap((orden) => {
    return orden.items.map((item) => {
      const detalleCatálogo = detallesMap.get(item.productoId);

      return {
        itemId: item.id,
        ordenId: orden.id,
        fecha: orden.createdAt,
        estado: orden.estado,
        productoId: item.productoId,
        nombre: detalleCatálogo?.nombre ?? "Producto no disponible",
        vendedor: detalleCatálogo?.vendedor ?? "Desconocido",
        imagenUrl: detalleCatálogo?.imagenUrl ?? "/placeholder-perfume.jpg",
        precioHistorico: item.precio,
        cantidad: item.cantidad,
      };
    });
  });

  historialPlano.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return z.array(ItemOrdenDetalleSchema).parse(historialPlano);
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
