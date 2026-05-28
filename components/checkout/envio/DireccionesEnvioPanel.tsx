"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DireccionDb } from "@/schema/direccion.schema";
import { eliminarDireccion } from "@/actions/direcciones";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import InfoOperacion from "./InfoOperacion";
import { CheckCircle2, MapPin, PencilLine, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormularioDireccion from "./FormularioDireccion";

export default function DireccionesEnvioPanel({
  direcciones,
}: {
  direcciones: DireccionDb[];
}) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [direccionEditando, setDireccionEditando] =
    useState<DireccionDb | null>(null);
  const [isPending, startTransition] = useTransition();

  const [seleccionada, setSeleccionada] = useState<string>(
    direcciones[0]?.id ?? "",
  );

  const seleccionadoValido = direcciones.some((d) => d.id === seleccionada)
    ? seleccionada
    : (direcciones[0]?.id ?? "");

  const handleAbrirCrear = () => {
    setDireccionEditando(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (dir: DireccionDb) => {
    setDireccionEditando(dir);
    setModalAbierto(true);
  };

  const handleBorrar = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    startTransition(async () => {
      await eliminarDireccion(id);
    });
  };

  const handleContinuarCompra = () => {
    if (!seleccionada) return;

    router.push(`/checkout/metodo-envio?direccionId=${seleccionada}`);
  };

  return (
    <section className="space-y-6">
      <InfoOperacion
        pasoActual="Paso 1 de 2"
        accion="Elegí una dirección de envío"
        informacion="Seleccioná una dirección guardada o creá una nueva para seguir con el checkout."
      />

      <div className="flex justify-end">
        <ModalDireccionEnvio
          open={modalAbierto}
          onOpenChange={setModalAbierto}
          direccionEditando={direccionEditando}
          onAbrirCrear={handleAbrirCrear}
          onSuccess={() => setModalAbierto(false)}
        />
      </div>

      <RadioGroup
        value={seleccionadoValido}
        onValueChange={setSeleccionada}
        className="space-y-3"
      >
        {direcciones.map((dir) => (
          <DireccionEnvioCard
            key={dir.id}
            dir={dir}
            seleccionado={seleccionadoValido === dir.id}
            estaPendiente={isPending}
            onEdit={handleAbrirEditar}
            onDelete={handleBorrar}
          />
        ))}
      </RadioGroup>

      <div className="border-t pt-4">
        <Button
          className="h-12 w-full text-lg"
          disabled={!seleccionadoValido || isPending}
          onClick={handleContinuarCompra}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Continuar compra
        </Button>
      </div>
    </section>
  );
}

function ModalDireccionEnvio({
  open,
  onOpenChange,
  direccionEditando,
  onAbrirCrear,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direccionEditando: DireccionDb | null;
  onAbrirCrear: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        variant="outline"
        size="lg"
        onClick={onAbrirCrear}
        className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
      >
        <Plus className="mr-2 h-4 w-4" /> Nueva dirección
      </Button>

      <DialogContent className="max-w-4xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {direccionEditando
              ? "Editar dirección"
              : "Agregar dirección de envío"}
          </DialogTitle>
        </DialogHeader>
        <FormularioDireccion
          direccionAEditar={direccionEditando}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function DireccionEnvioCard({
  dir,
  seleccionado,
  estaPendiente,
  onEdit,
  onDelete,
}: {
  dir: DireccionDb;
  seleccionado: boolean;
  estaPendiente: boolean;
  onEdit: (dir: DireccionDb) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card
      className={
        seleccionado
          ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border/70 hover:border-primary/30 hover:bg-muted/20"
      }
    >
      <CardContent className="flex items-center gap-4 p-4 md:p-5">
        <label className="flex min-w-0 grow cursor-pointer items-start gap-4">
          <RadioGroupItem value={dir.id} id={dir.id} className="mt-1" />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-foreground">
                {dir.nombreDestinatario}
              </span>
              {seleccionado && (
                <Badge className="rounded-full bg-primary text-primary-foreground">
                  Seleccionada
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 text-foreground/90">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">
                  {dir.calle} {dir.altura}
                  {dir.pisoDepto && ` · ${dir.pisoDepto}`}
                </span>
              </p>
              <p>
                {dir.localidad}, {dir.provincia} · CP {dir.codigoPostal}
              </p>
              <p>Teléfono: {dir.telefono}</p>
            </div>
          </div>
        </label>

        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => onEdit(dir)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            disabled={estaPendiente}
            onClick={() => onDelete(dir.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
