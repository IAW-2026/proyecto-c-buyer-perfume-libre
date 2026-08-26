import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { calcularTotalProductos } from "@/lib/utils";
import { obtenerOrdenDeUsuario } from "@/actions/checkout";
import { obtenerDireccionPorId } from "@/actions/direcciones";
import { obtenerDetallesProducto } from "@/lib/api";
import { EstadosOrden } from "@/schema/perfume.schema";
import DetallesEnvio from "@/components/checkout/confirmacion/DetallesEnvio";
import ProductosResumen from "@/components/checkout/confirmacion/ProductosResumen";
import TicketCompra from "@/components/checkout/confirmacion/TicketCompra";

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
      EstadosOrden.enum.PENDIENTE,
      EstadosOrden.enum.CANCELADO,
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
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-[28px] sm:text-[36px] font-normal text-foreground leading-[1.1] tracking-tight">
            Revisa y confirma tu orden
          </h1>
          <p className="text-[13px] sm:text-[14px] font-light text-muted-foreground mt-2">
            Último paso antes del pago seguro. Verifica que los datos de entrega
            y productos sean correctos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
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
