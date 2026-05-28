import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calcularTotalProductos, cn, formatearPrecio } from "@/lib/utils";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { obtenerDireccionPorId } from "@/actions/direcciones";
import { obtenerDetallesProducto } from "@/lib/api";
import { DireccionDb } from "@/schema/direccion.schema";
import {
  EstadosOrden,
  itemsDeOrdenDb,
  OrdenDeCompraDb,
  Perfume,
} from "@/schema/perfume.schema";

type Props = {
  searchParams: Promise<{ ordenId?: string }>;
};

export default async function ConfirmacionCheckoutPage({
  searchParams,
}: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { ordenId } = await searchParams;
  if (!ordenId) redirect("/carrito");

  let orden;
  try {
    orden = await obtenerOrdenDeUsuario(ordenId, EstadosOrden.enum.Pendiente);
  } catch {
    redirect("/carrito");
  }

  const direccion = await obtenerDireccionPorId(orden.direccionId);

  const idsProductos = orden.items.map((item) => item.productoId);
  const productosInfo = await obtenerDetallesProducto(idsProductos);

  const subtotalProductos = calcularTotalProductos(orden.items);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Encabezado />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <DetallesEnvio
              operadorEnvio={orden.operadorEnvio}
              servicioEnvio={orden.servicioEnvio}
              direccion={direccion}
            />

            <ProductosResumen
              items={orden.items}
              productosInfo={productosInfo}
            />
          </div>

          <TicketCompra
            subtotal={subtotalProductos}
            costoEnvio={orden.costoEnvio}
            total={orden.total}
            ordenId={orden.id}
          />
        </div>
      </div>
    </div>
  );
}

function Encabezado() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
        Revisá y confirmá tu compra
      </h1>
      <p className="text-sm md:text-base text-slate-500 mt-1">
        Último paso. Verificá que todo esté correcto para ir a pagar.
      </p>
    </div>
  );
}

function DetallesEnvio({
  operadorEnvio,
  servicioEnvio,
  direccion,
}: {
  operadorEnvio: string;
  servicioEnvio: string;
  direccion: DireccionDb;
}) {
  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-4 pt-5 px-6">
        <CardTitle className="text-base flex items-center gap-2 text-slate-800">
          <Truck className="w-5 h-5 text-blue-600" />
          Datos de entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          {/* Datos del correo (Estos los tenés en tu orden) */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Método elegido
            </p>
            <p className="font-medium text-slate-900">{operadorEnvio}</p>
            <p className="text-sm text-slate-600">Servicio {servicioEnvio}</p>
          </div>

          <div className="space-y-1 md:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 md:text-right">
              Destino
            </p>
            <p className="font-medium text-slate-900">
              {direccion.calle}, {direccion.altura}
            </p>
            <p className="text-sm text-slate-600">
              {direccion.localidad}, {direccion.provincia} (CP{" "}
              {direccion.codigoPostal})
            </p>
            <p className="text-sm text-slate-500 pt-1">
              Recibe: {direccion.nombreDestinatario}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductosResumen({
  items,
  productosInfo,
}: {
  items: itemsDeOrdenDb;
  productosInfo: Perfume[];
}) {
  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-4 pt-5 px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Productos en tu orden
          </CardTitle>
          <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-6">
              {/* CUADRADO DE IMAGEN (REEMPLAZAR CON URL DEL FETCH) */}
              <div className="h-20 w-20 shrink-0 rounded-lg bg-slate-100 border flex items-center justify-center">
                <img
                  src={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.imagenesUrl[0] || "/placeholder.png"
                  }
                  alt={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.nombre || "Producto"
                  }
                  className="h-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {productosInfo.find((p) => p.id === item.productoId)
                        ?.nombre || "Producto desconocido"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Cant: {item.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-slate-900">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </p>
                    {item.cantidad > 1 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {formatearPrecio(item.precio)} c/u
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TicketCompra({
  subtotal,
  costoEnvio,
  total,
  ordenId,
}: {
  subtotal: number;
  costoEnvio: number;
  total: number;
  ordenId: string;
}) {
  return (
    <div className="relative">
      <Card className="border-border/70 shadow-lg lg:sticky lg:top-24 overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">
            Resumen de cuenta
          </h2>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal productos</span>
              <span className="font-mono font-medium text-slate-900">
                {formatearPrecio(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Costo de envío</span>
              <span className="font-mono font-medium text-slate-900">
                {formatearPrecio(costoEnvio)}
              </span>
            </div>
          </div>

          <Separator className="border-dashed" />

          <div className="flex justify-between items-end">
            <span className="font-bold text-slate-900">Total a pagar</span>
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
              {formatearPrecio(total)}
            </span>
          </div>

          <div className="pt-4 space-y-4">
            <Link
              href={`/simulador-pagos?ordenId=${ordenId}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full h-14 text-base font-semibold shadow-md rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center",
              )}
            >
              Pagar de forma segura{" "}
              <ChevronRight className="w-5 h-5 ml-2 opacity-70" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Serás redirigido a la pasarela corporativa.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
