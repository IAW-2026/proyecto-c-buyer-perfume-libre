"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstadosOrden } from "@/schema/perfume.schema";

export function FiltrosOrdenes() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentEstado = searchParams.get("estado") ?? "Todos";

  const [termino, setTermino] = useState(currentQ);

  useEffect(() => {
    setTermino(currentQ);
  }, [currentQ]);

  const updateFiltro = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "Todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.value;
    setTermino(nuevoValor);
    updateFiltro("q", nuevoValor);
  };

  const handleLimpiar = () => {
    setTermino("");
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-card p-4 rounded-sm border border-border/60 shadow-sm">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID de Orden..."
          value={termino}
          onChange={handleSearchChange}
          className="pl-9 h-10 text-[13px] bg-secondary/20 border-border/60 focus-visible:ring-accent rounded-sm shadow-none"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={currentEstado}
          onValueChange={(value) => updateFiltro("estado", value)}
        >
          <SelectTrigger className="h-10 text-[13px] bg-secondary/20 border-border/60 focus:ring-accent rounded-sm shadow-none">
            <SelectValue placeholder="Filtrar por Estado" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border/60 bg-card">
            <SelectItem value="Todos" className="text-[13px]">
              Todos los estados
            </SelectItem>
            {Object.values(EstadosOrden.enum).map((estado) => (
              <SelectItem key={estado} value={estado} className="text-[13px]">
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(currentQ || currentEstado !== "Todos") && (
        <Button
          variant="ghost"
          onClick={handleLimpiar}
          disabled={isPending}
          className="h-10 px-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-sm w-full sm:w-auto"
        >
          <X className="h-3.5 w-3.5 mr-2" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
