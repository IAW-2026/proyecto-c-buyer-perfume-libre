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
            {/* Tarjeta de compra simulada 1 */}
            <SkeletonOrden />
            {/* Tarjeta de compra simulada 2 */}
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
      <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-48 bg-secondary/80 rounded-sm" />{" "}
            {/* Fecha e items */}
          </div>
          {/* Badge de estado */}
          <Skeleton className="h-5 w-20 rounded-sm bg-secondary/80" />
        </div>
      </div>

      {/* Detalle del Producto */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        {/* Imagen */}
        <Skeleton className="relative w-20 shrink-0 aspect-3/4 rounded-sm bg-secondary/80 border border-border/30" />

        {/* Info del producto */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2.5 w-full grow">
            {/* Nombre del perfume */}
            <Skeleton className="h-5 w-3/4 md:w-64 bg-secondary/80 rounded-sm" />
            {/* Vendedor */}
            <Skeleton className="h-3 w-32 bg-secondary/50 rounded-sm" />
            {/* Unidades */}
            <Skeleton className="h-3 w-20 bg-secondary/50 rounded-sm" />
          </div>

          {/* Botón ver detalle */}
          <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <Skeleton className="h-9 w-full sm:w-28 rounded-sm bg-secondary/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
