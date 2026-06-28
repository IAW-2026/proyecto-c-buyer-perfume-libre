"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iniciarProcesamientoCompra } from "@/actions/checkout";
import { OpcionEnvio } from "@/lib/mockEnvios";
import { formatearPrecio } from "@/lib/utils";

const obtenerIdVirtual = (opcion: OpcionEnvio) => {
  return `${opcion.operador}-${opcion.tipo_servicio}`;
};

export default function PanelMetodosEnvio({
  opciones,
  direccionId,
  productosIds,
  esCompraDirecta,
}: {
  opciones: OpcionEnvio[];
  direccionId: string;
  productosIds: string[];
  esCompraDirecta: boolean;
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
        productosIds,
        esCompraDirecta,
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="divide-y divide-border/40 border-b border-border/40 bg-transparent">
        {opciones.map((opcion) => {
          const idVirtual = obtenerIdVirtual(opcion);
          const isSelected =
            seleccionadoId === idVirtual ||
            (!seleccionadoId && idVirtual === obtenerIdVirtual(opciones[0]));

          return (
            <label
              key={idVirtual}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer transition-colors hover:bg-secondary/20 ${
                isSelected ? "bg-secondary/30" : ""
              }`}
              onClick={() => setSeleccionadoId(idVirtual)}
            >
              <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                <div className="mt-1 sm:mt-0 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-background" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[14px] font-bold text-foreground">
                      {opcion.operador}
                    </span>
                  </div>
                  <span className="text-[12px] font-light text-muted-foreground uppercase tracking-wide mt-1">
                    {opcion.tipo_servicio}{" "}
                    <span className="mx-1.5 opacity-50">|</span> Llega en{" "}
                    {opcion.demora_dias}{" "}
                    {opcion.demora_dias === 1 ? "día" : "días"}
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
          disabled={
            !opcionSeleccionada || isPending || productosIds.length === 0
          }
          onClick={handleConfirmarEnvio}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Procesando..." : "Confirmar Envío"}
        </Button>
      </div>
    </div>
  );
}
