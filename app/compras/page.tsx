import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { obtenerProductosComprados } from "@/lib/api";
import {
  ItemComprado, //TODO: Quitar cuando se haga la nueva ui.
  OrdenCompraCard,
  OrdenCompraCardSchema,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import z from "zod";
import { obtenerComprasDelUsuario } from "@/actions/compras";
import { formatearPrecio } from "@/lib/utils";

export default async function MisComprasPage() {
  const obtenerComprasDb = await obtenerComprasDelUsuario();

  const obtenerComprasDbValidado = z
    .array(OrdenDeCompraDbSchema)
    .parse(obtenerComprasDb);

  const perfumesCompradosId = obtenerIdComprados(obtenerComprasDbValidado);

  const detallePerfumesComprados =
    await obtenerProductosComprados(perfumesCompradosId);

  const itemsComprados = fusionarCompradoConDetalles(
    obtenerComprasDbValidado,
    detallePerfumesComprados,
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Mis Compras</h1>

        <HistorialCompras ordenes={itemsComprados} />
      </main>
    </div>
  );
}

function CompraItem({ compra }: { compra: ItemComprado }) {
  return (
    <div key={compra.id} className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted-foreground ml-1">
        {compra.fechaCompra.toLocaleDateString()}{" "}
      </span>

      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center md:items-stretch">
            <div className="flex items-center gap-4 p-4 md:p-6 flex-1">
              <ProductImagen
                imagenUrl={compra.imagenUrl}
                nombre={compra.nombre}
              />

              <ProductDetalles
                estado={compra.estado}
                nombre={compra.nombre}
                vendedor={compra.vendedor}
                cantidad={compra.cantidad}
              />
            </div>

            <PurchaseActions />
          </div>
        </CardContent>
      </Card>
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
    <div className="relative h-20 w-20 shrink-0 border rounded-md overflow-hidden bg-white">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
    </div>
  );
}

function ProductDetalles({
  estado,
  nombre,
  vendedor,
  cantidad,
}: {
  estado: string;
  nombre: string;
  vendedor: string;
  cantidad: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Badge
        className={`w-fit font-semibold ${
          estado === "Entregado"
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
        } border-none shadow-none`}
      >
        {estado}
      </Badge>
      <h3 className="font-medium text-sm md:text-base leading-tight line-clamp-1">
        {nombre}
      </h3>
      <p className="text-xs text-muted-foreground">
        {cantidad} unidad
        {cantidad > 1 ? "es" : ""} • Vendido por{" "}
        <span className="text-foreground font-medium">{vendedor}</span>
      </p>
    </div>
  );
}

function PurchaseActions() {
  return (
    <div className="w-full md:w-auto p-4 md:p-6 flex flex-col md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30 md:bg-transparent">
      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
      >
        Volver a comprar
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-blue-200 text-blue-600 font-bold hover:bg-blue-50"
      >
        Ver compra
      </Button>
    </div>
  );
}

function ComprasVacias() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">
        Todavía no realizaste ninguna compra.
      </p>
      <Button>
        <Link href="/">Empezar a comprar</Link>
      </Button>
    </div>
  );
}

type OrdenesDeCompra = {
  id: string;
  estado: string;
  total: number;
  createdAt: Date;
  items: {
    id: string;
    productoId: string;
    precio: number;
    cantidad: number;
  }[];
}[];

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

function HistorialCompras({ ordenes }: { ordenes: OrdenCompraCard[] }) {
  return (
    <div className="flex flex-col gap-6">
      {ordenes.map((orden) => (
        /* TARJETA DE LA ORDEN DE COMPRA */
        <div
          key={orden.id}
          className="bg-white border rounded-xl shadow-sm overflow-hidden"
        >
          {/* Encabezado de la Orden */}
          <div className="bg-slate-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 font-mono">
                ORDEN: {orden.id}
              </p>
              <p className="text-sm text-slate-600">
                Comprado el {orden.fecha.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {orden.estado}
              </span>
              <p className="text-lg font-bold text-foreground">
                Total: {formatearPrecio(orden.total)}
              </p>
            </div>
          </div>

          {/* LISTA DE ITEMS ADENTRO DE ESTA ORDEN */}
          <div className="p-4 divide-y">
            {orden.items.map((item) => (
              <div
                key={item.id}
                className="py-3 flex justify-between items-center first:pt-0 last:pb-0"
              >
                <div className="flex gap-4 items-center">
                  {/* Aquí va tu componente <Image src={item.imagenUrl} /> */}
                  <div>
                    <h4 className="font-medium text-sm">{item.nombre}</h4>
                    <p className="text-xs text-slate-400">
                      Vendedor: {item.vendedor}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatearPrecio(item.precioHistorico * item.cantidad)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
