import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="block h-full w-full">
      <div className="flex h-full w-full flex-col overflow-hidden border border-border bg-card p-0 shadow-xs">
        {/* 1. ÁREA DE IMAGEN */}
        <div className="relative aspect-3/4 w-full overflow-hidden bg-secondary/20 shrink-0">
          <Skeleton className="h-full w-full rounded-none bg-secondary/40" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          {/* Placeholder de la Marca */}
          <div className="mb-2 shrink-0">
            <Skeleton className="h-3 w-1/3 bg-secondary/50 rounded-sm" />
          </div>

          {/* Placeholder del Nombre del Perfume */}
          <div className="mb-3 flex-1">
            <Skeleton className="h-4 w-5/6 bg-secondary/60 rounded-sm" />
            <Skeleton className="mt-1.5 h-4 w-1/2 bg-secondary/30 rounded-sm" />
          </div>

          <div className="mt-auto space-y-2 pt-2 shrink-0">
            {/* Tamaño */}
            <Skeleton className="h-3 w-1/4 bg-secondary/40 rounded-sm" />

            {/* Precio */}
            <div className="pt-1">
              <Skeleton className="h-5 w-5/12 bg-secondary/70 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductGridSkeleton() {
  return (
    <div className="w-full min-w-0 space-y-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-x-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

      {/* Placeholder del Paginador */}
      <div className="flex justify-center border-t border-border pt-8">
        <Skeleton className="h-10 w-64 rounded-sm bg-secondary/40" />
      </div>
    </div>
  );
}
