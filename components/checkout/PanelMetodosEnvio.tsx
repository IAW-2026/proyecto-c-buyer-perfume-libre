"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iniciarProcesamientoCompra } from "@/actions/checkout";
import { OpcionEnvio } from "@/lib/mockEnvios";
import { formatearPrecio } from "@/lib/utils";

export default function PanelMetodosEnvio({
  opciones,
  direccionId,
}: {
  opciones: OpcionEnvio[];
  direccionId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const [seleccionadoId, setSeleccionadoId] = useState<string | undefined>();

  const opcionSeleccionada =
    opciones.find((o) => obtenerIdVirtual(o) === seleccionadoId) ?? opciones[0];

  const handleConfirmarEnvio = () => {
    if (!opcionSeleccionada) return;

    startTransition(async () => {
      await iniciarProcesamientoCompra(direccionId, opcionSeleccionada);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="divide-y border-b bg-white">
        {opciones.map((opcion) => {
          const idVirtual = obtenerIdVirtual(opcion);
          const esSeleccionado =
            opcionSeleccionada &&
            opcionSeleccionada.operador === opcion.operador &&
            opcionSeleccionada.tipo_servicio === opcion.tipo_servicio;

          return (
            <label
              key={idVirtual}
              className={`flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-slate-50 ${
                esSeleccionado ? "bg-primary/5" : ""
              }`}
              onClick={() => setSeleccionadoId(idVirtual)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    esSeleccionado
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  }`}
                >
                  {esSeleccionado && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Truck
                      className={`h-4 w-4 ${esSeleccionado ? "text-primary" : "text-slate-400"}`}
                    />
                    <span
                      className={`font-semibold ${esSeleccionado ? "text-primary" : "text-slate-900"}`}
                    >
                      {opcion.operador}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {opcion.tipo_servicio} · Llega en {opcion.demora_en_dias}{" "}
                    días
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-lg font-bold text-slate-900">
                  {formatearPrecio(opcion.precio)}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="p-6 bg-slate-50/50 flex justify-end">
        <Button
          className="h-12 w-full md:w-auto md:min-w-62.5 text-base rounded-full shadow-md"
          disabled={!opcionSeleccionada || isPending}
          onClick={handleConfirmarEnvio}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-5 w-5" />
          )}
          {isPending ? "Preparando tu resumen..." : "Continuar al pago"}
        </Button>
      </div>
    </div>
  );
}

function obtenerIdVirtual(opcion: OpcionEnvio) {
  return `${opcion.operador}-${opcion.tipo_servicio}`;
}
