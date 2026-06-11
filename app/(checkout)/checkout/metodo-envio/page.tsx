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

export const metadata = {
  title: "Método de Envío - Perfume Libre",
  description: "Selecciona el método de envío para tu compra",
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
    <main className="w-full bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
          <div className="space-y-6">
            <InfoOperacion
              pasoActual="Paso 2 de 2"
              accion="Opciones de entrega"
              informacion="Selecciona el servicio logístico que mejor se adapte a tus necesidades. El costo se sumará al total de tu compra."
            />

            <Card className="rounded-sm border-border/60 shadow-sm overflow-hidden bg-card">
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
