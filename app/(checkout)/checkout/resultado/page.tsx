// app/checkout/resultado/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowLeft,
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
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatearPrecio } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ status?: string; ordenId?: string }>;
};

export default async function CheckoutResultadoPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status, ordenId } = await searchParams;

  if (!ordenId) redirect("/carrito");

  // Buscamos la orden en nuestra base de datos para mostrar los datos finales del ticket
  const orden = await prisma.ordenCompra.findUnique({
    where: { id: ordenId, usuarioId: userId },
  });

  if (!orden) redirect("/carrito");

  // UX Pro-tip: Evaluamos lo que dice nuestra base de datos, no solo la URL
  const esExitoso = status === "success" && orden.estado === "Pagado";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-100">
        {/* CASO TRISTE: PAGO RECHAZADO */}
        {!esExitoso && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Pago Rechazado
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 pt-1">
                No pudimos procesar la transacción con tu tarjeta de crédito o
                débito.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-center text-sm text-slate-600">
              <p className="bg-slate-50 p-3 rounded-lg border text-xs font-mono text-slate-500">
                Orden de referencia: {orden.id}
              </p>
              <p>
                No te preocupes, **no realizamos ningún cargo** a tu cuenta.
                Podés volver a intentar el pago utilizando otro medio de cobro.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-4">
              {/* Botón para volver a intentar: re-inyecta al usuario al wizard con la misma orden pendiente */}
              <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
                <Link href={`/checkout/confirmacion?ordenId=${orden.id}`}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Volver a intentar pago
                </Link>
              </Button>
              <Button variant="ghost" className="w-full text-slate-500">
                <Link href="/carrito">Volver al carrito</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* CASO FELIZ: PAGO APROBADO */}
        {esExitoso && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                ¡Pago Confirmado! 🎉
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 pt-1">
                Tu orden ha sido procesada de forma segura.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>ORDEN: {orden.id}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-900 pt-2 border-t border-dashed">
                  <span>Total abonado</span>
                  <span className="font-mono text-green-600">
                    {formatearPrecio(orden.total)}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 px-2">
                Le enviamos una notificación a la *Shipping App* corporativa.
                Pronto vas a poder ver el código de seguimiento de tu perfume en
                tu panel.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Seguir comprando
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-11">
                <Link href="/compras/historial">
                  Ver mis pedidos{" "}
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
