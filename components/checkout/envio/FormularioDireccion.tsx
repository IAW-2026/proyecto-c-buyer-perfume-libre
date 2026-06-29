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
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col h-full max-h-[80vh]"
    >
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[calc(85vh-140px)] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* SECCIÓN 1: DESTINATARIO */}
        <div className="rounded-sm border border-border/50 bg-secondary/10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Datos del destinatario
          </p>
          <div className="mt-4 space-y-4">
            <CampoFormulario
              nombre="nombreDestinatario"
              texto="Nombre completo de quien recibe"
              ejemplo="Ej: Juan Pérez"
              control={form.control}
            />
            <CampoFormulario
              nombre="telefono"
              texto="Teléfono de contacto (Móvil)"
              ejemplo="Ej: 291456789"
              control={form.control}
            />
          </div>
        </div>

        {/* SECCIÓN 2: DOMICILIO */}
        <div className="rounded-sm border border-border/50 bg-transparent p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Domicilio de entrega
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
              texto="Altura / Número"
              ejemplo="1234"
              control={form.control}
            />
            <CampoFormulario
              nombre="pisoDepto"
              texto="Piso / Departamento (Opcional)"
              ejemplo="Piso 3, Depto B"
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
              texto="Localidad / Ciudad"
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
      </div>

      {/* FOOTER DEL FORMULARIO */}
      <div className="flex flex-col gap-4 border-t border-border/40 pt-5 mt-4 md:flex-row md:items-center md:justify-between bg-card">
        <p className="text-[12px] font-light text-muted-foreground max-w-sm">
          Asegúrate de que los datos ingresados sean correctos para evitar
          demoras en el proceso logístico.
        </p>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-w-48 h-12 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md cursor-pointer"
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          )}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar dirección"}
        </Button>
      </div>
    </form>
  );
}
