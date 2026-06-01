import { obtenerDireccionPorId } from "@/actions/direcciones";
import PanelMetodosEnvio from "../../../../components/checkout/PanelMetodosEnvio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { obtenerCotizacionesEnvio } from "@/lib/mockEnvios";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InfoOperacion from "@/components/checkout/envio/InfoOperacion";

type Props = {
  searchParams: Promise<{ direccionId?: string; productoId?: string }>;
};

export default async function MetodoEnvioPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { direccionId, productoId } = await searchParams;
  if (!direccionId) redirect("/checkout/envio");

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
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
          <div className="space-y-6">
            <InfoOperacion
              pasoActual="Paso 2 de 2"
              accion="Elegí el método de envío"
              informacion="Seleccioná la opción que mejor se adapte a tus tiempos. Los costos se sumarán al total de tu orden."
            />

            <Card className="border-border/70 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <PanelMetodosEnvio
                  opciones={opcionesDeEnvio}
                  direccionId={direccionId}
                  productoId={productoId}
                />
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <DireccionSeleccionadaCard
              calle={direccion.calle}
              altura={direccion.altura}
              pisoDepto={direccion.pisoDepto}
              localidad={direccion.localidad}
              provincia={direccion.provincia}
              codigoPostal={direccion.codigoPostal}
            />
          </div>
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
      <Card className="border-border/70 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <MapPinned className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800">
                Destino del envío
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="space-y-1.5 text-sm text-slate-600">
            <p className="font-medium text-slate-900 text-base mb-2">
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
