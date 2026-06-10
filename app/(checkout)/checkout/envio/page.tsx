import { obtenerDireccionesUsuario } from "@/actions/direcciones";
import PrimeraDireccionPantalla from "@/components/checkout/envio/PrimeraDireccionPantalla";
import DireccionesEnvioPanel from "@/components/checkout/envio/DireccionesEnvioPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Direcciones de Envío - Perfume Libre",
  description: "Gestiona tus direcciones de envío para tus compras",
};

export default async function CheckoutEnvioPage({
  searchParams,
}: {
  searchParams: Promise<{ productoId?: string }>;
}) {
  const { productoId } = await searchParams;
  const direcciones = await obtenerDireccionesUsuario();

  return (
    <div className="w-full bg-linear-to-b from-background via-background to-secondary/10">
      <main className="container mx-auto px-4 py-8 md:px-8 max-w-6xl">
        {direcciones.length === 0 ? (
          <PrimeraDireccionPantalla />
        ) : (
          <DireccionesEnvioPanel
            direcciones={direcciones}
            productoId={productoId}
          />
        )}
      </main>
    </div>
  );
}
