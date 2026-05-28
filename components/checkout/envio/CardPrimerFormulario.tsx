"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import FormularioDireccion from "./FormularioDireccion";
import { useRouter } from "next/navigation";

export default function CardFormulario() {
  const router = useRouter();

  const handleGuardadoExitoso = (idDireccion?: string) => {
    if (idDireccion) {
      router.push(`/checkout/metodo-envio?direccionId=${idDireccion}`);
    } else {
      router.push("/checkout/envio");
    }
  };

  return (
    <Card className="overflow-hidden border-border/70 bg-background shadow-lg shadow-black/5">
      <div className="border-b w-full bg-slate-50/50">
        <div className="flex flex-col space-y-1.5 px-6 pt-6 pb-6 md:px-8 md:pt-8 md:pb-8">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">
              Dirección de envío
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight md:text-3xl">
            ¿Dónde enviamos tu compra?
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            No tienes direcciones guardadas todavía. Completá este formulario y
            seguí al siguiente paso sin perder el ritmo de compra.
          </p>
        </div>
      </div>

      <CardContent className="p-6 md:p-8">
        <FormularioDireccion
          direccionAEditar={null}
          onSuccess={handleGuardadoExitoso}
        />
      </CardContent>
    </Card>
  );
}
