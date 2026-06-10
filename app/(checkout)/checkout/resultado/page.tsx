import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatearPrecio } from "@/lib/utils";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { EstadosOrden } from "@/schema/perfume.schema";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{ status?: string; ordenId?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { status, ordenId } = await searchParams;

  if (!ordenId) {
    return { title: "Resultado del Pago" };
  }

  try {
    const orden = await obtenerOrdenDeUsuario(ordenId, [
      EstadosOrden.enum.Pagado,
      EstadosOrden.enum.Rechazado,
    ]);

    const esExitoso = status === "success" && orden.estado === "Pagado";

    return {
      title: esExitoso
        ? "Pago Aprobado - Perfume Libre"
        : "Pago Rechazado - Perfume Libre",
      description: esExitoso
        ? "Tu transacción fue procesada con éxito. ¡Muchas gracias por tu compra!"
        : "Hubo un problema al procesar tu pago. No realizamos ningún cargo.",
    };
  } catch {
    return {
      title: "Estado de la Orden",
    };
  }
}

export default async function CheckoutResultadoPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status, ordenId } = await searchParams;

  if (!ordenId) redirect("/carrito");

  let orden;
  try {
    orden = await obtenerOrdenDeUsuario(ordenId, [
      EstadosOrden.enum.Pagado,
      EstadosOrden.enum.Rechazado,
    ]);
  } catch {
    redirect("/carrito");
  }

  const esExitoso = status === "success" && orden.estado === "Pagado";

  return (
    <div className="w-full bg-background flex flex-1 items-center justify-center p-4 py-12 md:py-20">
      <Card className="w-full max-w-md shadow-lg border-border/60 rounded-sm bg-card overflow-hidden">
        {esExitoso ? (
          <PagoExitoso ordenId={orden.id} total={orden.total} />
        ) : (
          <PagoRechazado ordenId={orden.id} />
        )}
      </Card>
    </div>
  );
}

function PagoRechazado({ ordenId }: { ordenId: string }) {
  return (
    <div>
      <CardHeader className="text-center pt-10 pb-2">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/5 mb-5 ring-8 ring-destructive/5">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <CardTitle className="font-serif text-[28px] font-normal text-foreground tracking-tight">
          Pago Rechazado
        </CardTitle>
        <CardDescription className="text-[14px] font-light text-muted-foreground pt-2 px-4 leading-relaxed">
          No pudimos procesar la transacción con el medio de pago seleccionado.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-center text-[13px] text-muted-foreground px-6 md:px-8 mt-2">
        <div className="bg-secondary/10 p-5 rounded-sm border border-border/40 flex flex-col gap-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
            Orden de referencia
          </span>
          <span className="font-mono text-foreground font-medium text-[12px]">
            {ordenId}
          </span>
        </div>
        <p className="leading-relaxed font-light">
          No te preocupes,{" "}
          <strong className="text-foreground font-semibold">
            no realizamos ningún cargo
          </strong>{" "}
          a tu cuenta. Puedes volver a intentarlo usando otra tarjeta u otro
          medio de cobro.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-6 pb-10 md:px-8">
        <Link
          href={`/checkout/confirmacion?ordenId=${ordenId}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md",
          )}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Volver a intentar pago
        </Link>

        <Link
          href="/carrito"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm border border-border/60 text-foreground hover:bg-secondary transition-all",
          )}
        >
          Volver al carrito
        </Link>
      </CardFooter>
    </div>
  );
}

function PagoExitoso({ ordenId, total }: { ordenId: string; total: number }) {
  return (
    <div>
      <CardHeader className="text-center pt-10 pb-2">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/5 mb-5 ring-8 ring-accent/5">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <CardTitle className="font-serif text-[28px] font-normal text-foreground tracking-tight">
          Pago Confirmado
        </CardTitle>
        <CardDescription className="text-[14px] font-light text-muted-foreground pt-2 px-4 leading-relaxed">
          Tu orden ha sido procesada de forma segura.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 md:px-8 mt-2">
        <div className="bg-secondary/10 p-6 rounded-sm border border-border/40 space-y-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-muted-foreground">
              N° de Orden
            </span>
            <span className="font-mono text-foreground font-medium text-[11px]">
              {ordenId.slice(0, 12)}...
            </span>
          </div>

          <div className="border-t border-border/40 pt-5 flex justify-between items-end">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-muted-foreground">
              Total abonado
            </span>
            <span className="font-serif text-[24px] font-normal text-foreground leading-none">
              {formatearPrecio(total)}
            </span>
          </div>
        </div>

        <p className="text-center text-[13px] font-light text-muted-foreground mt-6 leading-relaxed px-2">
          Le enviamos una notificación a la{" "}
          <strong>plataforma de envíos</strong>. Pronto podrás hacer el
          seguimiento de tu paquete.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-6 pb-10 pt-2 md:px-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md",
          )}
        >
          <ShoppingBag className="w-4 h-4 mr-2 opacity-80" /> Seguir explorando
        </Link>

        <Link
          href="/compras/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm border border-border/60 text-foreground hover:bg-secondary transition-all",
          )}
        >
          Ver mis pedidos <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
        </Link>
      </CardFooter>
    </div>
  );
}
