"use client";

import FormularioDireccion from "./FormularioDireccion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrimeraDireccionPantalla() {
  return (
    <div className="max-w-md mx-auto space-y-6 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">
            ¿Dónde enviamos tu compra?
          </CardTitle>
          <p className="text-sm text-slate-500">
            No tienes direcciones guardadas. Agrega la primera para continuar
            con el pago.
          </p>
        </CardHeader>
        <CardContent>
          <FormularioDireccion direccionAEditar={null} onSuccess={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}
