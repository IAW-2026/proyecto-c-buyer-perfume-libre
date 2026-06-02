"use client";

import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Trash2, Wand2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generarDatosPrueba, limpiarDatosPrueba } from "@/actions/admin";

export function HerramientasDesarrollo() {
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState(false);

  const handleGenerar = () => {
    startTransition(async () => {
      await generarDatosPrueba();
    });
  };

  const handleLimpiar = (e: React.MouseEvent) => {
    e.preventDefault();

    startTransition(async () => {
      await limpiarDatosPrueba();
      setOpenDialog(false);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGenerar}
        disabled={isPending}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-2 border-dashed border-primary text-primary hover:bg-primary/10",
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        Generar Datos
      </button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogTrigger
          disabled={isPending}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los usuarios y órdenes generadas de
              prueba. No afectará a las compras reales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleLimpiar}
              disabled={isPending}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
