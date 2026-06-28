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
import { limpiarDatosPrueba } from "@/actions/admin";

export function HerramientasDesarrollo() {
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState(false);

  const handleGenerar = () => {
    startTransition(async () => {
      // await generarDatosPrueba();
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
          buttonVariants({ variant: "outline" }),
          "h-10 px-4 text-[10px] uppercase tracking-widest font-bold rounded-sm border-border/60 text-foreground hover:border-accent hover:text-accent hover:bg-transparent transition-colors",
        )}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-3.5 w-3.5" />
        )}
        Generar Datos
      </button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogTrigger
          disabled={isPending}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-10 w-10 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </AlertDialogTrigger>

        <AlertDialogContent className="rounded-sm border-border/60 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-[22px] font-normal text-foreground">
              ¿Estás completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] font-light text-muted-foreground">
              Esta acción eliminará todos los usuarios y órdenes generadas de
              prueba. No afectará a las transacciones reales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isPending}
              className="rounded-sm h-11 text-[11px] uppercase tracking-widest font-bold"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLimpiar}
              disabled={isPending}
              className="rounded-sm h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[11px] uppercase tracking-widest font-bold"
            >
              {isPending && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              Sí, eliminar datos de prueba
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
