"use client";

import * as React from "react";
import { useTransition } from "react";
import { Loader2, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { iniciarProcesamientoCompra } from "@/actions/checkout";
import { OpcionEnvio } from "@/lib/mockEnvios";

export default function PanelMetodosEnvio({
  opciones,
  direccionId,
}: {
  opciones: OpcionEnvio[];
  direccionId: string;
}) {
  const [seleccionado, setSeleccionado] = React.useState(opciones[0]);
  const [isPending, startTransition] = useTransition();

  const handleConfirmarEnvio = () => {
    startTransition(async () => {
      await iniciarProcesamientoCompra(direccionId, seleccionado);
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {opciones.map((opcion, index) => {
          const esIgual =
            seleccionado.operador === opcion.operador &&
            seleccionado.tipo_servicio === opcion.tipo_servicio;
          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all border-2 ${esIgual ? "border-blue-500 bg-blue-50/20" : "hover:border-slate-300"}`}
              onClick={() => setSeleccionado(opcion)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Truck
                    className={`w-5 h-5 ${esIgual ? "text-blue-600" : "text-slate-400"}`}
                  />
                  <div>
                    <p className="font-semibold text-slate-950">
                      {opcion.operador}
                    </p>
                    <p className="text-xs text-slate-500">
                      {opcion.tipo_servicio} • Llega en {opcion.demora_en_dias}{" "}
                      días
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ${opcion.precio / 100}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        className="w-full h-12 text-base mt-4"
        disabled={isPending}
        onClick={handleConfirmarEnvio}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Preparando tu resumen..." : "Continuar al resumen"}
      </Button>
    </div>
  );
}
