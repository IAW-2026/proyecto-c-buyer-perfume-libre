import { obtenerDetalleCompra } from "@/actions/compras";
import Header from "@/components/header";
import { OrdenCompraCard } from "@/schema/perfume.schema";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function DetalleCompraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const orden = await obtenerDetalleCompra(id);

  if (!orden) {
    return notFound();
  }

  console.log("Detalle de la orden:", orden);
  return (
    <Suspense fallback={<p>Cargando detalles de la compra...</p>}>
      <div className="min-h-screen bg-slate-50/50">
        <Header />
        <main className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl font-bold mb-8">Detalle de la Compra</h1>
          <p>Aquí se mostrarán los detalles de la compra seleccionada.</p>
          <p>Orden id: {orden.id}</p>
        </main>
      </div>
    </Suspense>
  );
}
