"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { DireccionDb, DireccionSchema } from "@/schema/direccion.schema";
import { agregarDireccion, editarDireccion } from "@/actions/direcciones";
import { Button } from "@/components/ui/button";
import CampoFormulario from "./CampoFormulario";
import z from "zod";

type FormValues = z.infer<typeof DireccionSchema>;

export default function FormularioDireccion({
  onSuccess,
  direccionAEditar,
}: {
  onSuccess: (idDireccion?: string) => void;
  direccionAEditar?: DireccionDb | null;
}) {
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
      let idGuardado;

      if (direccionAEditar) {
        await editarDireccion(direccionAEditar.id, data);
      } else {
        idGuardado = await agregarDireccion(data);
      }

      onSuccess(idGuardado);
      form.reset();
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:p-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Datos del destinatario
        </p>
        <div className="mt-4 space-y-4">
          <CampoFormulario
            nombre="nombreDestinatario"
            texto="Nombre de quien recibe"
            ejemplo="Ej: Juan Pérez"
            control={form.control}
          />

          <CampoFormulario
            nombre="telefono"
            texto="Teléfono de contacto"
            ejemplo="291..."
            control={form.control}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background p-4 md:p-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Domicilio
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Revisá los datos antes de guardar. Después vas a poder editarlos.
        </p>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-w-44 rounded-full"
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar dirección"}
        </Button>
      </div>
    </form>
  );
}
