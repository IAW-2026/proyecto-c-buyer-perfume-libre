"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";
import { ContenidoFiltros } from "./filtros";

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
          className={`hidden md:flex h-10 items-center gap-2 rounded-[8px] border px-4 transition-all duration-200 ${
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

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className="flex h-10 items-center gap-2 rounded-[8px] border px-4 border-border bg-card text-foreground hover:bg-secondary"
                />
              }
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="text-[12px] font-semibold tracking-wide">
                Filtros
              </span>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[85vw] sm:w-87.5 overflow-y-auto"
            >
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-lg font-bold">
                  Filtrar Perfumes
                </SheetTitle>
              </SheetHeader>
              <ContenidoFiltros />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex items-start">
        <div
          className={`hidden md:block shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full ${
            filtrosAbiertos
              ? "w-68 mr-4 max-h-[calc(100vh-160px)] opacity-100"
              : "w-0 max-h-0 opacity-0"
          }`}
        >
          <div className="w-64">
            <ContenidoFiltros />
          </div>
        </div>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
