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
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm flex flex-col sm:flex-row items-center sm:items-stretch p-0">
      {/* 1. Área de Imagen */}
      <Skeleton className="relative w-full sm:w-40 shrink-0 aspect-3/4 sm:aspect-auto sm:min-h-45 bg-secondary/80 rounded-none border-b sm:border-b-0 sm:border-r border-border/40" />

      {/* 2. Área de Información */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between w-full text-center sm:text-left">
        <div className="flex flex-col gap-2.5 items-center sm:items-start">
          {/* Marca */}
          <Skeleton className="h-2.5 w-16 bg-secondary/80 rounded-sm" />
          {/* Nombre de la fragancia  */}
          <Skeleton className="h-6 w-3/4 sm:w-1/2 bg-secondary/80 rounded-sm" />
          {/* Precio */}
          <div className="mt-1">
            <Skeleton className="h-5 w-24 bg-secondary/80 rounded-sm" />
          </div>
        </div>

        {/* Acciones (Eliminar / Comprar ahora) */}
        <div className="flex items-center justify-center sm:justify-start gap-4 mt-6 sm:mt-0">
          <Skeleton className="h-3 w-16 bg-secondary/80 rounded-sm" />
          {/* Separador vertical que usamos en el diseño real */}
          <div className="w-px h-3 bg-border hidden sm:block" />
          <Skeleton className="h-3 w-24 bg-secondary/80 rounded-sm hidden sm:block" />
        </div>
      </div>

      {/* 3. Área del Botón */}
      <div className="p-5 sm:p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-border/40 shrink-0 w-full sm:w-auto">
        <Skeleton className="w-full sm:w-46.5 h-12 rounded-sm bg-foreground/10" />
      </div>
    </div>
  );
}
