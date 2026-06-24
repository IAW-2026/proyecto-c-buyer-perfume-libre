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
import { cn } from "@/lib/utils";

export default function DireccionesEnvioPanel({
  direcciones,
  items,
  directo,
}: {
  direcciones: DireccionDb[];
  items?: string;
  directo?: string;
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

    const queryParams = new URLSearchParams();
    queryParams.set("direccionId", seleccionada);
    if (items) queryParams.set("items", items);
    if (directo) queryParams.set("directo", directo);

    router.push(`/checkout/metodo-envio?${queryParams.toString()}`);
  };

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <InfoOperacion
        pasoActual="Paso 1 de 2"
        accion="Dirección de entrega"
        informacion="Selecciona un domicilio registrado o agrega una nueva ubicación para continuar con el proceso de compra."
      />

      <div className="flex justify-end pt-2">
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
        className="space-y-4"
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

      <div className="border-t border-border/40 pt-6 mt-8">
        <Button
          disabled={!seleccionadoValido || isPending}
          onClick={handleContinuarCompra}
          className="w-full h-14 text-[13px] uppercase tracking-wider font-bold bg-foreground text-background hover:bg-foreground/90 rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
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
        onClick={onAbrirCrear}
        className="rounded-sm border-border/60 text-[11px] uppercase tracking-[0.08em] font-bold text-foreground hover:bg-secondary h-11 px-5 shadow-2xs transition-all cursor-pointer"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Nueva dirección
      </Button>

      <DialogContent className="w-full max-w-xl! rounded-sm border-border/60 bg-card p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-serif text-[24px] font-normal text-foreground">
            {direccionEditando
              ? "Modificar Dirección"
              : "Nueva Dirección de Envío"}
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
      className={cn(
        "rounded-sm transition-all duration-300 shadow-2xs overflow-hidden border",
        seleccionado
          ? "border-accent bg-accent/5 shadow-xs" // Tono dorado arena ultra sutil cuando está marcado
          : "border-border/60 hover:border-accent/40 bg-card hover:bg-secondary/10",
      )}
    >
      <CardContent className="flex items-center gap-4 p-5 md:px-6">
        <label className="flex min-w-0 grow cursor-pointer items-start gap-4">
          <RadioGroupItem
            value={dir.id}
            id={dir.id}
            className="mt-1 border-border/80 focus-visible:ring-accent data-[state=checked]:border-accent data-[state=checked]:text-accent"
          />

          <div className="min-w-0 space-y-2 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-serif text-[17px] font-normal text-foreground leading-none">
                {dir.nombreDestinatario}
              </span>
              {seleccionado && (
                <Badge className="rounded-sm bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-[0.08em] border-none px-2 py-0.5">
                  Seleccionada
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-[13px] font-light text-muted-foreground leading-relaxed">
              <p className="flex items-center gap-2 text-foreground/90 font-medium">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="truncate">
                  {dir.calle} {dir.altura}
                  {dir.pisoDepto && ` · ${dir.pisoDepto}`}
                </span>
              </p>
              <p>
                {dir.localidad}, {dir.provincia}{" "}
                <span className="mx-1 text-border/60">·</span> CP{" "}
                {dir.codigoPostal}
              </p>
              <p className="text-[12px] opacity-90 mt-1">
                Teléfono: {dir.telefono}
              </p>
            </div>
          </div>
        </label>

        <div className="flex shrink-0 gap-1 border-l border-border/40 pl-2 sm:pl-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground/60 hover:text-foreground hover:bg-transparent h-8 w-8 transition-colors"
            onClick={() => onEdit(dir)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground/60 hover:text-destructive hover:bg-transparent h-8 w-8 transition-colors"
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
