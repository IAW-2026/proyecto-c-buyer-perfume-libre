import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calcularTotalProductos, cn, formatearPrecio } from "@/lib/utils";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { obtenerDireccionPorId } from "@/actions/direcciones";
import { obtenerDetallesProducto } from "@/lib/api";
import { DireccionDb } from "@/schema/direccion.schema";
import { EstadosOrden, itemsDeOrdenDb, Perfume } from "@/schema/perfume.schema";

type Props = {
  searchParams: Promise<{ ordenId?: string }>;
};

export const metadata = {
  title: "Confirmación de Compra",
  description: "Revisá los detalles de tu compra antes de pagar",
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
    orden = await obtenerOrdenDeUsuario(ordenId, [
      EstadosOrden.enum.Pendiente,
      EstadosOrden.enum.Rechazado,
    ]);
  } catch {
    redirect("/carrito");
  }

  const direccion = await obtenerDireccionPorId(orden.direccionId);

  const idsProductos = orden.items.map((item) => item.productoId);
  const productosInfo = await obtenerDetallesProducto(idsProductos);

  const subtotalProductos = calcularTotalProductos(orden.items);

  return (
    <div className="w-full bg-background py-8 md:py-12">
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
      <h1 className="font-serif text-[clamp(28px,4vw,36px)] font-normal text-foreground leading-[1.1] tracking-tight">
        Revisa y confirma tu orden
      </h1>
      <p className="text-[14px] font-light text-muted-foreground mt-2">
        Último paso antes del pago seguro. Verifica que los datos de entrega y
        productos sean correctos.
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
    <Card className="rounded-sm border-border/60 shadow-sm overflow-hidden bg-card">
      <CardHeader className="bg-secondary/30 border-b border-border/40 pb-4 pt-5 px-6">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-foreground">
          <Truck className="w-4 h-4 text-accent" />
          Datos de entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div className="space-y-1 text-left">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-2.5">
              Método de envío
            </p>
            <p className="font-serif text-[18px] font-normal text-foreground leading-none">
              {operadorEnvio}
            </p>
            <p className="text-[13px] font-light text-muted-foreground mt-1.5">
              Servicio {servicioEnvio}
            </p>
          </div>

          <div className="space-y-1 text-left md:text-right">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-2.5 md:text-right">
              Domicilio de destino
            </p>
            <p className="font-serif text-[18px] font-normal text-foreground leading-none">
              {direccion.calle} {direccion.altura}
            </p>
            <p className="text-[13px] font-light text-muted-foreground mt-1.5">
              {direccion.localidad}, {direccion.provincia}{" "}
              <span className="mx-1 text-border/60">·</span> CP{" "}
              {direccion.codigoPostal}
            </p>
            <p className="text-[12px] font-medium text-foreground/80 pt-2 uppercase tracking-wide">
              Destinatario: {direccion.nombreDestinatario}
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
    <Card className="rounded-sm border-border/60 shadow-sm overflow-hidden bg-card">
      <CardHeader className="bg-secondary/30 border-b border-border/40 pb-4 pt-5 px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-foreground">
            <ShoppingBag className="w-4 h-4 text-accent" />
            Artículos en la orden
          </CardTitle>
          <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-muted-foreground bg-background px-2.5 py-0.5 rounded-sm border border-border/60">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 p-5 sm:p-6 items-center">
              <div className="relative w-16 sm:w-20 shrink-0 aspect-3/4 bg-secondary rounded-sm border border-border/40 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.imagenesUrl[0] || "/placeholder.png"
                  }
                  alt={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.nombre || "Producto"
                  }
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="text-left">
                    <h3 className="font-serif text-[18px] font-normal text-foreground leading-tight line-clamp-1">
                      {productosInfo.find((p) => p.id === item.productoId)
                        ?.nombre || "Producto desconocido"}
                    </h3>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">
                      Cantidad:{" "}
                      <span className="font-semibold text-foreground/80">
                        {item.cantidad}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </p>
                    {item.cantidad > 1 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">
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
      <Card className="rounded-sm border-border/60 shadow-sm lg:sticky lg:top-24 overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8 space-y-5">
          <h2 className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground mb-4">
            Resumen de cuenta
          </h2>

          <div className="space-y-3 text-[13px] font-light text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal productos</span>
              <span className="font-medium text-foreground">
                {formatearPrecio(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Costo de envío</span>
              <span className="font-medium text-foreground">
                {costoEnvio > 0 ? formatearPrecio(costoEnvio) : "Gratis"}
              </span>
            </div>
          </div>

          <Separator className="border-border/60" />

          <div className="flex justify-between items-baseline py-1">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
              Total a pagar
            </span>
            <span className="font-serif text-[26px] font-normal text-foreground">
              {formatearPrecio(total)}
            </span>
          </div>

          <div className="pt-4 space-y-4">
            <Link
              href={`/simulador-pagos?ordenId=${ordenId}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full h-14 text-[13px] uppercase tracking-wider font-bold bg-foreground text-background hover:bg-foreground/90 transition-all rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2",
              )}
            >
              Pagar de forma segura
              <ChevronRight className="w-4 h-4 opacity-80" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] font-light text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Serás redirigido a la pasarela cifrada corporativa.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
