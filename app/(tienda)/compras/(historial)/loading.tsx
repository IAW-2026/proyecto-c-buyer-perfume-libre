import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCompras() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Skeleton de nav */}
        <Skeleton className="mb-6 h-3 w-32 bg-secondary/80 rounded-sm" />

        <div className="flex flex-col gap-8">
          {/* Título de la página y descripción */}
          <div>
            <Skeleton className="h-9 md:h-11 w-64 md:w-80 bg-secondary/80 rounded-sm mb-3" />
            <Skeleton className="h-4 w-72 md:w-96 bg-secondary/50 rounded-sm" />
          </div>

          <div className="flex flex-col gap-6">
            {/* Tarjetas de compra simuladas */}
            <SkeletonOrden />
            <SkeletonOrden />
          </div>
        </div>
      </main>
    </div>
  );
}

function SkeletonOrden() {
  return (
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm">
      {/* Header de la orden */}
      <div className="border-b border-border/60 bg-secondary/30 px-4 sm:px-5 py-3 sm:py-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-32 bg-secondary/80 rounded-sm" />{" "}
            {/* Fecha */}
            <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 bg-secondary/50 rounded-sm" />{" "}
            {/* Artículos */}
          </div>
          {/* Badge de estado */}
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-sm bg-secondary/80 shrink-0" />
        </div>
      </div>

      {/* Detalle del Producto */}
      <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 gap-4 sm:gap-5">
        <div className="flex flex-row flex-1 items-stretch gap-4 min-w-0">
          {/* Imagen */}
          <Skeleton className="relative w-20 shrink-0 min-h-26.5 rounded-sm bg-secondary/80 border border-border/30" />

          {/* Info del producto */}
          <div className="flex min-w-0 flex-col justify-center grow gap-2 sm:gap-2.5">
            {/* Nombre del perfume */}
            <Skeleton className="h-4 sm:h-5 w-full sm:w-3/4 md:w-64 bg-secondary/80 rounded-sm" />
            {/* Vendedor */}
            <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32 bg-secondary/50 rounded-sm" />
            {/* Unidades */}
            <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 bg-secondary/50 rounded-sm" />
          </div>
        </div>

        {/* Botón ver detalle*/}
        <div className="shrink-0 pt-3 sm:pt-0 border-t border-border/40 sm:border-transparent mt-1 sm:mt-0">
          <Skeleton className="h-10 w-full sm:w-28 rounded-sm bg-secondary/80" />
        </div>
      </div>
    </div>
  );
}
