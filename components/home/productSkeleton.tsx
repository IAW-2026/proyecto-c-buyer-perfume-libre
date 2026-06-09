import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Skeleton className="flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-sm">
      {/* Area de imagen */}
      <div className="aspect-square w-full border-b bg-transparent" />

      {/* Area del contenido */}
      <div className="flex flex-1 flex-col gap-0.5 p-4 pt-3">
        {/* Placeholder de Marca */}
        <div className="h-3 w-1/4 rounded bg-black/5" />

        {/* Placeholder de Nombre */}
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="h-4 w-full rounded bg-black/5" />
        </div>

        {/* Placeholder de Tamaño */}
        <div className="mt-1 h-3 w-1/3 rounded bg-black/5" />

        {/* PRECIO Y BOTÓN*/}
        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {/* Placeholder de Precio */}
              <div className="h-8 w-1/2 rounded bg-black/5" />
            </div>
            {/* Placeholder de botón */}
            <div className="h-9 w-full rounded bg-black/5" />
          </div>
        </div>
      </div>
    </Skeleton>
  );
}

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 justify-center gap-4 sm:grid-cols-[repeat(auto-fit,minmax(235px,235px))]">
      {Array.from({ length: 9 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
