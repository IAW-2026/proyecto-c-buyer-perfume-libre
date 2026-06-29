"use client";

import { useTransition } from "react";
import { Settings2, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { simularCambioEstado } from "@/actions/compras";
import { cn } from "@/lib/utils";

export function SimuladorEnvio({
  ordenId,
  itemId,
}: {
  ordenId: string;
  itemId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleCambio = (nuevoEstado: string) => {
    startTransition(async () => {
      await simularCambioEstado(ordenId, itemId, nuevoEstado);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-sm border-border/60 text-[10px] uppercase tracking-[0.08em] font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Settings2 className="w-3.5 h-3.5 mr-2" />
        {isPending ? "Simulando..." : "Simular Envío"}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-sm border-border/60 shadow-md"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold py-2">
            Forzar estado
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />

          <DropdownMenuItem
            onClick={() => handleCambio("Pagado")}
            className="text-[12px] focus:bg-secondary focus:text-accent cursor-pointer"
          >
            Simular: Pagado
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCambio("En proceso")}
            className="text-[12px] focus:bg-secondary focus:text-accent cursor-pointer"
          >
            Simular: En proceso
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCambio("Enviado")}
            className="text-[12px] focus:bg-secondary focus:text-accent cursor-pointer"
          >
            Simular: Enviado
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/60" />

        <DropdownMenuItem
          onClick={() => handleCambio("Entregado")}
          className="text-[12px] text-foreground font-medium focus:text-accent focus:bg-secondary cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-accent" />
          Simular: Entregado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
