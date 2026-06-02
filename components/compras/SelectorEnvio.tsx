"use client";

import { useTransition } from "react";
import { Settings2, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className:
            "border-slate-300 hover:bg-slate-100 focus:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
        })}
      >
        <Settings2 className="w-4 h-4 mr-2" />
        {isPending ? "Simulando..." : "Simular Envio"}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          {" "}
          <DropdownMenuLabel className="text-xs text-slate-500 uppercase">
            Forzar estado
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCambio("Pagado")}>
            Simular: Pagado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCambio("En proceso")}>
            Simular: En proceso
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCambio("Enviado")}>
            Simular: Enviado
          </DropdownMenuItem>
        </DropdownMenuGroup>{" "}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleCambio("Entregado")}
          className="text-green-600 focus:text-green-700 focus:bg-green-50"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Simular: Entregado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
