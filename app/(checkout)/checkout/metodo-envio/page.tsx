import { obtenerDireccionPorId } from "@/actions/direcciones";
import PanelMetodosEnvio from "../../../../components/checkout/PanelMetodosEnvio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { obtenerCotizacionesEnvio } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InfoOperacion from "@/components/checkout/envio/InfoOperacion";

type Props = {
  searchParams: Promise<{
    direccionId?: string;
    items?: string;
    directo?: string;
  }>;
};

export const metadata = {
  title: "Método de Envío - Perfume Libre",
  description: "Selecciona el método de envío para tu compra",
};

export default async function MetodoEnvioPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { direccionId, items, directo } = await searchParams;
  if (!direccionId) redirect("/checkout/envio");

  const productosIds = items ? items.split(",") : [];
  const esCompraDirecta = directo === "true";

  let direccion;
  try {
    direccion = await obtenerDireccionPorId(direccionId);
  } catch (error) {
    redirect("/checkout/envio");
  }

  const opcionesDeEnvio = await obtenerCotizacionesEnvio(
    direccion.codigoPostal,
    direccion.calle,
  );

  return (
    <main className="container mx-auto px-4 py-8 md:px-8 max-w-6xl animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h1 className="font-serif text-[28px] md:text-[32px] text-foreground leading-tight">
              Elegí el envío
            </h1>
          </div>

          <div className="bg-card border border-border/60 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
            <PanelMetodosEnvio
              opciones={opcionesDeEnvio}
              direccionId={direccionId}
              productosIds={productosIds}
              esCompraDirecta={esCompraDirecta}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DireccionSeleccionadaCard {...direccion} />
          <InfoOperacion
            pasoActual="Paso 2 de 2"
            accion="Opciones de entrega"
            informacion="Selecciona el servicio logístico que mejor se adapte a tus necesidades. El costo se sumará al total de tu compra."
          />
        </div>
      </div>
    </main>
  );
}

function DireccionSeleccionadaCard({
  calle,
  altura,
  pisoDepto,
  localidad,
  provincia,
  codigoPostal,
}: {
  calle: string;
  altura: string;
  pisoDepto: string | null;
  localidad: string;
  provincia: string;
  codigoPostal: string;
}) {
  return (
    <aside className="sticky top-24 space-y-4">
      <Card className="rounded-sm border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/30 border-b border-border/40 pb-4 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-foreground">
              <MapPinned className="h-4 w-4" />
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                Destino del envío
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-1.5 text-[13px] font-light text-muted-foreground leading-relaxed">
            <p className="font-serif font-normal text-foreground text-[20px] mb-2 leading-none">
              {calle} {altura} {pisoDepto && `- ${pisoDepto}`}
            </p>
            <p>CP: {codigoPostal}</p>
            <p>
              {localidad}, {provincia}
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
