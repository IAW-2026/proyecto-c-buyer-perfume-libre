import { obtenerDireccionPorId } from "@/actions/direcciones";
import PanelMetodosEnvio from "@/components/checkout/PanelMetodosEnvio";
import { obtenerCotizacionesEnvio } from "@/lib/mockEnvios";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ direccionId?: string }>;
};

export default async function MetodoEnvioPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { direccionId } = await searchParams;
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
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">
        ¿Cómo querés recibir tu compra?
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Seleccioná una de las opciones disponibles para tu zona.
      </p>

      <PanelMetodosEnvio opciones={opcionesDeEnvio} direccionId={direccionId} />
    </main>
  );
}
