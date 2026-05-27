"use client";

import { Plus, PencilLine, Trash2 } from "lucide-react";
import { DireccionDb } from "@/schema/direccion.schema";
import { eliminarDireccion } from "@/actions/direcciones";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useTransition } from "react";
import FormularioDireccion from "./FormularioDireccion";
import { useRouter } from "next/navigation";

export default function DireccionesEnvioPanel({
  direcciones,
}: {
  direcciones: DireccionDb[];
}) {
  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [seleccionada, setSeleccionada] = React.useState<string | undefined>(
    direcciones[0]?.id,
  );

  const router = useRouter();

  const [direccionEditando, setDireccionEditando] =
    React.useState<DireccionDb | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleAbrirCrear = () => {
    setDireccionEditando(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (dir: DireccionDb) => {
    setDireccionEditando(dir);
    setModalAbierto(true);
  };

  // TODO: Mejorar UI
  const handleBorrar = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta dirección?")) {
      startTransition(async () => {
        await eliminarDireccion(id);

        if (seleccionada === id) {
          setSeleccionada(direcciones.find((d) => d.id !== id)?.id);
        }
      });
    }
  };

  const handleContinuarCompra = () => {
    if (!seleccionada) return;

    router.push(`/checkout/metodo-envio?direccionId=${seleccionada}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Opciones de envío
        </h2>

        <ModalDireccion />
      </div>

      <RadioGroup
        value={seleccionada}
        onValueChange={setSeleccionada}
        className="space-y-3"
      >
        {direcciones.map((dir) => (
          <OpcionesEnvio key={dir.id} dir={dir} />
        ))}
      </RadioGroup>

      <div className="pt-4 border-t">
        <Button
          className="w-full text-lg h-12"
          disabled={!seleccionada || isPending}
          onClick={handleContinuarCompra}
        >
          Continuar compra
        </Button>
      </div>
    </div>
  );

  function ModalDireccion() {
    return (
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAbrirCrear}
          className="text-blue-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Nueva Dirección
        </Button>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {direccionEditando
                ? "Editar dirección"
                : "Agregar dirección de envío"}
            </DialogTitle>
          </DialogHeader>
          <FormularioDireccion
            direccionAEditar={direccionEditando}
            onSuccess={() => setModalAbierto(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  function OpcionesEnvio({ dir }: { dir: DireccionDb }) {
    return (
      <Card
        className={
          seleccionada === dir.id
            ? "border-blue-500 bg-blue-50/30"
            : "hover:border-slate-300"
        }
      >
        <CardContent className="p-0 flex items-center pr-4">
          <label className="grow flex items-start p-4 cursor-pointer">
            <RadioGroupItem value={dir.id} id={dir.id} className="mt-1" />
            <div className="ml-4 space-y-1 w-full">
              <span className="font-medium text-slate-900">
                {dir.calle} {dir.altura} {dir.pisoDepto && `- ${dir.pisoDepto}`}
              </span>
              <p className="text-sm text-slate-500">
                {dir.localidad}, {dir.provincia} - CP {dir.codigoPostal}
              </p>
            </div>
          </label>

          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-blue-600"
              onClick={() => handleAbrirEditar(dir)}
            >
              <PencilLine className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-red-600"
              disabled={isPending}
              onClick={() => handleBorrar(dir.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
