"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, PencilLine, Trash2 } from "lucide-react";
import * as z from "zod";
import { DireccionDb, DireccionSchema } from "@/schema/direccion.schema";
import {
  agregarDireccion,
  editarDireccion,
  eliminarDireccion,
} from "@/actions/direcciones";
import { Button, buttonVariants } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import CampoFormulario from "./CampoFormulario";
import { useTransition } from "react";

type FormValues = z.infer<typeof DireccionSchema>;

export default function DireccionesEnvioPanel({
  direcciones,
}: {
  direcciones: DireccionDb[];
}) {
  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [seleccionada, setSeleccionada] = React.useState<string | undefined>(
    direcciones[0]?.id,
  );

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
          disabled={!seleccionada}
          // onClick={() => redirigirAlResumen(seleccionada)}
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

function FormularioDireccion({
  onSuccess,
  direccionAEditar,
}: {
  onSuccess: () => void;
  direccionAEditar?: DireccionDb | null;
}) {
  // 1. Inicializamos con los datos existentes o en blanco
  const form = useForm<FormValues>({
    resolver: zodResolver(DireccionSchema),
    defaultValues: direccionAEditar
      ? {
          nombreDestinatario: direccionAEditar.nombreDestinatario,
          calle: direccionAEditar.calle,
          altura: direccionAEditar.altura,
          pisoDepto: direccionAEditar.pisoDepto || "",
          codigoPostal: direccionAEditar.codigoPostal,
          localidad: direccionAEditar.localidad,
          provincia: direccionAEditar.provincia,
          telefono: direccionAEditar.telefono,
        }
      : {
          nombreDestinatario: "",
          calle: "",
          altura: "",
          pisoDepto: "",
          codigoPostal: "",
          localidad: "",
          provincia: "",
          telefono: "",
        },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      if (direccionAEditar) {
        await editarDireccion(direccionAEditar.id, data);
      } else {
        await agregarDireccion(data);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
      <CampoFormulario
        nombre="nombreDestinatario"
        texto="Nombre de quien recibe"
        ejemplo="Ej: Juan Pérez"
        control={form.control}
      />

      <div className="grid grid-cols-2 gap-4">
        <CampoFormulario
          nombre="calle"
          texto="Calle"
          ejemplo="Av. San Martín"
          control={form.control}
        />

        <CampoFormulario
          nombre="altura"
          texto="Altura"
          ejemplo="1234"
          control={form.control}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CampoFormulario
          nombre="pisoDepto"
          texto="Piso/Depto (Opcional)"
          ejemplo="3B"
          control={form.control}
        />

        <CampoFormulario
          nombre="codigoPostal"
          texto="Código Postal"
          ejemplo="8000"
          control={form.control}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CampoFormulario
          nombre="localidad"
          texto="Localidad"
          ejemplo="Bahía Blanca"
          control={form.control}
        />

        <CampoFormulario
          nombre="provincia"
          texto="Provincia"
          ejemplo="Buenos Aires"
          control={form.control}
        />
      </div>

      <CampoFormulario
        nombre="telefono"
        texto="Teléfono de contacto"
        ejemplo="291..."
        control={form.control}
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Dirección"}
        </Button>
      </div>
    </form>
  );
}
