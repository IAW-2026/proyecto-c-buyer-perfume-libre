import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingFavoritos() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* Skeleton de nav */}
        <Skeleton className="mb-6 h-3 w-32 bg-secondary/80 rounded-sm" />

        {/* Skeleton del Encabezado */}
        <div className="mb-10">
          <Skeleton className="h-9 md:h-11 w-64 md:w-80 bg-secondary/80 rounded-sm mb-3" />
          <Skeleton className="h-4 w-72 md:w-96 bg-secondary/50 rounded-sm" />
        </div>

        {/* Lista de Tarjetas */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCardFavorito key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SkeletonCardFavorito() {
  return (
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-stretch p-0">
        <div className="flex flex-row flex-1 items-stretch">
          {/* Área de Imagen */}
          <Skeleton className="relative w-28 sm:w-40 shrink-0 min-h-35 sm:min-h-45 bg-secondary/80 rounded-none border-r border-border/40" />

          {/* Área de Información */}
          <div className="flex flex-col flex-1 p-4 sm:p-6 justify-between text-left min-w-0">
            <div className="flex flex-col gap-1">
              {/* Marca */}
              <Skeleton className="h-2.5 w-12 sm:w-16 bg-secondary/80 rounded-sm" />
              {/* Nombre de la fragancia */}
              <Skeleton className="h-4 sm:h-6 w-full sm:w-3/4 bg-secondary/80 rounded-sm mt-1" />
              {/* Precio */}
              <div className="mt-1 sm:mt-2">
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-24 bg-secondary/80 rounded-sm" />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center justify-start gap-3 mt-4 sm:mt-0">
              {/* Skeleton del botón miniatura del carrito (SOLO CELULAR) */}
              <div className="sm:hidden">
                <Skeleton className="h-8 w-10 bg-secondary/80 rounded-sm shadow-sm" />
              </div>

              {/* Skeleton Botón Eliminar */}
              <Skeleton className="h-3 w-14 sm:w-16 bg-secondary/80 rounded-sm" />

              {/* Separador vertical */}
              <div className="w-px h-3 bg-border hidden sm:block" />

              {/* Skeleton Comprar ahora (SOLO PC) */}
              <Skeleton className="h-3 w-24 bg-secondary/80 rounded-sm hidden sm:block" />
            </div>
          </div>
        </div>

        {/* 2. Área del Botón Gigante (SOLO PC) */}
        <div className="hidden sm:flex p-6 items-center justify-center border-l border-border/40 shrink-0 w-auto bg-transparent">
          <Skeleton className="w-45 h-12 rounded-sm bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
