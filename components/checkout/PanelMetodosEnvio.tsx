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
  productoId,
}: {
  opciones: OpcionEnvio[];
  direccionId: string;
  productoId?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const [seleccionadoId, setSeleccionadoId] = useState<string | undefined>();

  const opcionSeleccionada =
    opciones.find((o) => obtenerIdVirtual(o) === seleccionadoId) ?? opciones[0];

  const handleConfirmarEnvio = () => {
    if (!opcionSeleccionada) return;

    startTransition(async () => {
      await iniciarProcesamientoCompra(
        direccionId,
        opcionSeleccionada,
        productoId,
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="divide-y divide-border/40 border-b border-border/40 bg-transparent">
        {opciones.map((opcion) => {
          const idVirtual = obtenerIdVirtual(opcion);
          const esSeleccionado =
            opcionSeleccionada &&
            opcionSeleccionada.operador === opcion.operador &&
            opcionSeleccionada.tipo_servicio === opcion.tipo_servicio;

          return (
            <label
              key={idVirtual}
              className={`flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-secondary/10 ${
                esSeleccionado ? "bg-accent/5" : ""
              }`}
              onClick={() => setSeleccionadoId(idVirtual)}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                    esSeleccionado
                      ? "border-accent bg-accent"
                      : "border-border/80"
                  }`}
                >
                  {esSeleccionado && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <Truck
                      className={`h-4 w-4 ${esSeleccionado ? "text-accent" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`font-serif text-[18px] font-normal leading-none ${
                        esSeleccionado ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {opcion.operador}
                    </span>
                  </div>
                  <span className="text-[12px] font-light text-muted-foreground uppercase tracking-wide mt-1">
                    {opcion.tipo_servicio}{" "}
                    <span className="mx-1.5 opacity-50">|</span> Llega en{" "}
                    {opcion.demora_en_dias}{" "}
                    {opcion.demora_en_dias === 1 ? "día" : "días"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                  {formatearPrecio(opcion.precio)}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="p-6 bg-transparent flex justify-end">
        <Button
          className="h-12 w-full md:w-auto md:min-w-60 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md"
          disabled={!opcionSeleccionada || isPending}
          onClick={handleConfirmarEnvio}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Preparando pago..." : "Ir a pagar"}
        </Button>
      </div>
    </div>
  );
}

function obtenerIdVirtual(opcion: OpcionEnvio) {
  return `${opcion.operador}-${opcion.tipo_servicio}`;
}
