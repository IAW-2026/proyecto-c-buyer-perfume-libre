"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import FormularioDireccion from "./FormularioDireccion";
import { useRouter } from "next/navigation";

export default function CardFormulario({
  items,
  directo,
}: {
  items?: string;
  directo?: string;
}) {
  const router = useRouter();

  const handleGuardadoExitoso = (idDireccion?: string) => {
    if (idDireccion) {
      const queryParams = new URLSearchParams();
      queryParams.set("direccionId", idDireccion);
      if (items) queryParams.set("items", items);
      if (directo) queryParams.set("directo", directo);

      router.push(`/checkout/metodo-envio?${queryParams.toString()}`);
    } else {
      router.push("/checkout/envio");
    }
  };

  return (
    <Card className="overflow-hidden rounded-sm border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 w-full bg-transparent">
        <div className="flex flex-col px-6 py-6 md:px-8 md:py-8">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
              Nuevo domicilio
            </span>
          </div>

          <CardTitle className="font-serif text-[26px] md:text-[32px] font-normal text-foreground leading-tight tracking-tight">
            ¿Dónde enviamos tu compra?
          </CardTitle>
          <p className="mt-2 text-[14px] font-light text-muted-foreground leading-relaxed">
            Completa los siguientes campos para dar de alta tu ubicación y
            continuar hacia las opciones de entrega.
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
