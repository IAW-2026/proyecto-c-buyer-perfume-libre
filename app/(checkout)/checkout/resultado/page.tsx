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
      title: esExitoso ? "Pago Aprobado" : "Pago Rechazado",
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
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-border/50 overflow-hidden bg-white">
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4 ring-8 ring-red-50/50">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
          Pago Rechazado
        </CardTitle>
        <CardDescription className="text-base text-slate-500 pt-2 px-4">
          No pudimos procesar la transacción con tu medio de pago.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-center text-sm text-slate-600 px-6 md:px-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Orden de referencia
          </span>
          <span className="font-mono text-slate-700 font-medium">
            {ordenId}
          </span>
        </div>
        <p className="leading-relaxed">
          No te preocupes,{" "}
          <strong className="text-slate-900 font-semibold">
            no realizamos ningún cargo
          </strong>{" "}
          a tu cuenta. Podés volver a intentarlo usando otra tarjeta u otro
          medio de cobro.
        </p>
      </CardContent>

      {/* Esto se deberia encargar payments app */}
      <CardFooter className="flex flex-col gap-3 px-6 pb-8 md:px-8">
        <Link
          href={`/checkout/confirmacion?ordenId=${ordenId}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full text-base font-medium rounded-xl",
          )}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Volver a intentar pago
        </Link>

        <Link
          href="/carrito"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "w-full text-slate-500 hover:text-slate-900 rounded-xl",
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-4 ring-8 ring-green-50/50">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
          ¡Pago Confirmado! 🎉
        </CardTitle>
        <CardDescription className="text-base text-slate-500 pt-2 px-4">
          Tu orden ha sido procesada de forma segura.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 md:px-8 mt-2">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">N° de Orden</span>
            <span className="font-mono text-slate-900 font-semibold text-xs">
              {ordenId}
            </span>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-end">
            <span className="text-slate-900 font-semibold">Total abonado</span>
            <span className="font-mono text-xl font-bold text-green-600">
              {formatearPrecio(total)}
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6 leading-relaxed px-2">
          Le enviamos una notificación a la <strong>Shipping App</strong>.
          Pronto vas a ver el historial de tu pedido.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-4 md:px-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20",
          )}
        >
          <ShoppingBag className="w-5 h-5 mr-2 opacity-80" /> Seguir comprando
        </Link>

        <Link
          href="/compras/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50",
          )}
        >
          Ver mis pedidos <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
        </Link>
      </CardFooter>
    </div>
  );
}
