import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { EstadosOrden } from "@/schema/perfume.schema";
import CheckoutPayment from "@/components/checkout/CheckoutPayment";
import { centavosAPesos } from "@/lib/utils";

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

  return (
    <main className="max-w-xl mx-auto p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Finalizar Pago</h1>
      <p className="text-gray-600 mb-6">Orden: {orden.id}</p>

      <div className="bg-white rounded-lg shadow p-4">
        {/* Le pasamos los datos reales al componente */}
        <CheckoutPayment total={totalAPagar} ordenId={orden.id} />
      </div>
    </main>
  );
}
