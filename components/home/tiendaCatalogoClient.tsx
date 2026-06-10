"use client";

import SidebarFiltros from "@/components/home/sidebarFiltros";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function TiendaCatalogoClient({ children }: Props) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setFiltrosAbiertos((value) => !value)}
          className={`flex h-10 items-center gap-2 rounded-[8px] border px-4 transition-all duration-200 ${
            filtrosAbiertos
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-accent"
              : "border-border bg-card text-foreground hover:bg-secondary"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-[12px] font-semibold tracking-wide">
            Filtros
          </span>
        </Button>
      </div>

      <div className="flex items-start">
        <SidebarFiltros isOpen={filtrosAbiertos} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
