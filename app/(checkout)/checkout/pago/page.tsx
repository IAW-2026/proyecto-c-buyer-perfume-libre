import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { EstadosOrden } from "@/schema/perfume.schema";
import CheckoutPayment from "@/components/checkout/CheckoutPayment";
import { centavosAPesos, formatearPrecio } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PagoRealPage({
  searchParams,
}: {
  searchParams: Promise<{ ordenId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { ordenId } = await searchParams;
  if (!ordenId) redirect("/carrito");

  let orden;
  try {
    orden = await obtenerOrdenDeUsuario(ordenId, [
      EstadosOrden.enum.PENDIENTE,
      EstadosOrden.enum.CANCELADO,
    ]);
  } catch {
    redirect("/carrito");
  }

  const totalAPagar = centavosAPesos(orden.total);
  const subtotalProductos = orden.total - orden.costoEnvio;

  return (
    <main className="w-full bg-secondary/20 min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* COLUMNA IZQUIERDA: Formulario de Pago */}
          <div className="w-full">
            <Card className="border-border/60 shadow-lg bg-card p-4 md:p-6 w-full">
              <CheckoutPayment total={totalAPagar} ordenId={orden.id} />
            </Card>
          </div>

          {/* COLUMNA DERECHA: Ahora actúa como el carril por donde se desliza la tarjeta */}
          <div className="w-full h-full relative">
            <div className="space-y-8 lg:sticky lg:top-24 pt-4 lg:pt-0">
              <Card className="border-border/60 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] uppercase tracking-wider font-bold text-muted-foreground">
                      Resumen de tu orden
                    </span>
                    <span className="font-mono text-[12px] text-foreground bg-secondary px-2 py-1 rounded">
                      #{orden.id.slice(0, 8)}
                    </span>
                  </div>

                  <Separator className="my-4" />

                  {/* Desglose de Productos y Envío */}
                  <div className="space-y-3 mb-4 text-[14px] text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Subtotal productos</span>
                      <span>{formatearPrecio(subtotalProductos)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Costo de envío</span>
                      <span>
                        {orden.costoEnvio === 0
                          ? "Gratis"
                          : formatearPrecio(orden.costoEnvio)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4 border-border/60" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-medium text-foreground">
                      Total a pagar
                    </span>
                    <span className="font-light tracking-[-0.02em] text-[32px] text-foreground">
                      {formatearPrecio(orden.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Lock className="w-5 h-5 text-accent" />
                  <p className="text-[13px]">
                    Pago procesado bajo estándares de seguridad PCI-DSS.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <p className="text-[13px]">
                    Tus datos están cifrados de extremo a extremo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
