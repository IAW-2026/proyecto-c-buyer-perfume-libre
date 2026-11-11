import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatearPrecio } from "@/lib/utils";

export default function TicketCompra({
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
        <CardContent className="p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
          <h2 className="text-[12px] sm:text-[13px] uppercase tracking-[0.08em] font-bold text-foreground mb-3 sm:mb-4">
            Resumen de cuenta
          </h2>

          <div className="space-y-2.5 sm:space-y-3 text-[12px] sm:text-[13px] font-light text-muted-foreground">
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
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
              Total a pagar
            </span>
            <span className="font-light tracking-[-0.02em] text-[22px] sm:text-[26px] text-foreground">
              {formatearPrecio(total)}
            </span>
          </div>

          <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <Link
              href={`/checkout/pago?ordenId=${ordenId}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full h-12 sm:h-14 text-[12px] sm:text-[13px] uppercase tracking-wider font-bold bg-foreground text-background hover:bg-foreground/90 transition-all rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2",
              )}
            >
              Pagar de forma segura
              <ChevronRight className="w-4 h-4 opacity-80" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-light text-muted-foreground text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Serás redirigido a la pasarela cifrada corporativa.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
