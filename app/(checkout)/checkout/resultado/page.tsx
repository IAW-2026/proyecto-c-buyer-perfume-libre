import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import StatusScreenPayment from "@/components/checkout/StatusScreenPayment";
// El componente que creamos antes

type Props = {
  searchParams: Promise<{ payment_id?: string; ordenId?: string }>;
};

export const metadata: Metadata = {
  title: "Estado del Pago - Perfume Libre",
};

export default async function CheckoutResultadoPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { payment_id, ordenId } = await searchParams;

  // Si no hay ID de pago de Mercado Pago, lo mandamos al carrito
  if (!payment_id) redirect("/carrito");

  return (
    <div className="w-full bg-background flex flex-1 items-center justify-center p-4 min-h-screen">
      {/* Mantenemos tu Card, pero le sacamos el overflow-hidden por si el Brick necesita expandirse */}
      <div className="w-full max-w-md shadow-lg border border-border/60 rounded-sm bg-card p-6">
        <div className="mb-4 text-center">
          <h1 className="font-serif text-[24px] font-normal text-foreground tracking-tight">
            Resumen de tu transacción
          </h1>
          {ordenId && (
            <p className="text-[12px] text-muted-foreground mt-1">
              Orden: <span className="font-mono">{ordenId}</span>
            </p>
          )}
        </div>

        {/* Acá le pasamos la pelota a Mercado Pago para que dibuje el estado, el ticket o el error */}
        <StatusScreenPayment paymentId={payment_id} />

        {/* Podés agregar tus botones personalizados acá abajo si querés */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/compras"
            className="w-full h-12 flex items-center justify-center text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm border border-border/60 text-foreground hover:bg-secondary transition-all"
          >
            Ver mis pedidos
          </a>
        </div>
      </div>
    </div>
  );
}
