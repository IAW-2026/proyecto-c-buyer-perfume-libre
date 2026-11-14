import { auth } from "@clerk/nextjs/server";
import SiteBrand from "./SiteBrand";
import { BarraDeBusqueda } from "./BarraDeBusqueda";
import { BarraDeBusquedaSkeleton } from "@/components/layout/BarraDeBusquedaSkeleton";
import MenuMovil from "./MenuMovil";
import AccionesUsuario from "./AccionesUsuario";
import { Suspense } from "react";

export default async function Header() {
  const { userId, sessionClaims } = await auth();
  const initialSignedIn = !!userId;
  const initialAdmin = sessionClaims?.metadata?.rol === "ADMIN";

  return (
    <header className="w-full border-b border-border/60 bg-card py-4 sticky top-0 z-50 shadow-[0_1px_4px_rgba(28,21,16,0.03)]">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between relative min-h-12 w-full">
          {/* Menú móvil */}
          <div className="absolute left-0 md:hidden flex items-center z-10">
            <MenuMovil
              initialSignedIn={initialSignedIn}
              initialAdmin={initialAdmin}
            />
          </div>

          {/* Izquierda: Marca / Logo */}
          <div className="flex items-center justify-center md:justify-start w-full md:w-56 lg:w-64 shrink-0">
            <SiteBrand />
          </div>

          {/* Centro: Barra de búsqueda (fija en PC, simétrica e inmóvil ante login/logout) */}
          <div className="hidden md:flex flex-1 justify-center px-4 min-w-0">
            <Suspense fallback={<BarraDeBusquedaSkeleton />}>
              <BarraDeBusqueda />
            </Suspense>
          </div>

          {/* Derecha: Acciones de usuario */}
          <div className="absolute right-0 md:relative md:w-56 lg:w-64 flex items-center justify-end shrink-0">
            <AccionesUsuario
              initialSignedIn={initialSignedIn}
              initialAdmin={initialAdmin}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
