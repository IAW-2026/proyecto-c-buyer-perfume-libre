import Header from "@/components/layout/header";
import { obtenerDireccionesUsuario } from "@/actions/direcciones";
import PrimeraDireccionPantalla from "@/components/checkout/PrimeraDireccionPantalla";
import DireccionesEnvioPanel from "@/components/checkout/DireccionesEnvioPanel";

export default async function CheckoutEnvioPage() {
  const direcciones = await obtenerDireccionesUsuario();

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 md:px-8">
        {direcciones.length === 0 ? (
          <PrimeraDireccionPantalla />
        ) : (
          <DireccionesEnvioPanel direcciones={direcciones} />
        )}
      </main>
    </div>
  );
}
