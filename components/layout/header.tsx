import SiteBrand from "./SiteBrand";
import { BarraDeBusqueda } from "./BarraDeBusqueda";
import { BarraDeBusquedaSkeleton } from "@/components/layout/BarraDeBusquedaSkeleton";
import MenuMovil from "./MenuMovil";
import AccionesUsuario from "./AccionesUsuario";
import { Suspense } from "react";

export default function Header() {
  return (
    <header className="w-full border-b border-border/60 bg-card py-4 sticky top-0 z-50 shadow-[0_1px_4px_rgba(28,21,16,0.03)]">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between relative min-h-12 w-full">
          <div className="absolute left-0 md:hidden flex items-center">
            <MenuMovil />
          </div>

          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="md:w-auto w-full flex justify-center md:justify-start">
              <SiteBrand />
            </div>

            <div className="hidden md:block flex-1 min-w-0">
              <Suspense fallback={<BarraDeBusquedaSkeleton />}>
                <BarraDeBusqueda />
              </Suspense>
            </div>
          </div>

          <AccionesUsuario />
        </div>
      </div>
    </header>
  );
}
