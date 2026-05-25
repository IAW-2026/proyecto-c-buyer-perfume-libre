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
