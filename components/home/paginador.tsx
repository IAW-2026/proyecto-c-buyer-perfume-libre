"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Paginador({
  total,
  limite,
  paginaActual,
}: {
  total: number;
  limite: number;
  paginaActual: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPaginas = Math.ceil(total / limite);

  if (totalPaginas <= 1) return null;

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", nuevaPagina.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-1 sm:gap-2">
        {paginas.map((pagina) => {
          const esPaginaActual = pagina === paginaActual;

          return (
            <Button
              key={pagina}
              variant={esPaginaActual ? "default" : "outline"}
              size="icon"
              onClick={() => cambiarPagina(pagina)}
              className={`h-9 w-9 ${esPaginaActual ? "pointer-events-none" : ""}`}
            >
              {pagina}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
