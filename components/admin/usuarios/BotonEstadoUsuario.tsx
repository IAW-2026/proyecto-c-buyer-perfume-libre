"use client";

import { useTransition } from "react";
import { alternarEstadoUsuario } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BotonEstadoUsuario({
  usuarioId,
  estaBaneado,
}: {
  usuarioId: string;
  estaBaneado: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAlternarEstado = () => {
    if (
      !estaBaneado &&
      !confirm(
        "¿Estás seguro de que deseas suspender a este usuario? Perderá el acceso a la plataforma.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await alternarEstadoUsuario(usuarioId, estaBaneado);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAlternarEstado}
      disabled={isPending}
      className={cn(
        "h-8 px-3 text-[10px] uppercase tracking-widest font-bold border-border/60 transition-colors w-28",
        estaBaneado
          ? "bg-secondary/30 text-foreground hover:bg-secondary/50 hover:text-foreground"
          : "bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : estaBaneado ? (
        <>
          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Reactivar
        </>
      ) : (
        <>
          <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Suspender
        </>
      )}
    </Button>
  );
}
