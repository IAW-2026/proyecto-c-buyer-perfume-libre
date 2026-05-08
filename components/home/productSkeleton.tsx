import { Skeleton } from "@/components/ui/skeleton";

/* En lugar de <Card>, usamos un Skeleton con borde para que coincida, 
    con card no se veia bien el efecto de latido */
export function ProductCardSkeleton() {
  return (
    <Skeleton className="flex flex-col h-full w-full rounded-lg border shadow-sm overflow-hidden">
      {/* Area de la imagen*/}
      <div className="aspect-square w-full border-b bg-transparent" />

      {/* Area del contenido */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="h-3 w-1/4 bg-black/5 rounded" />{" "}
        <div className="h-5 w-full bg-black/5 rounded" />{" "}
        <div className="h-4 w-2/3 bg-black/5 rounded" />{" "}
        <div className="mt-auto pt-4">
          <div className="h-8 w-1/2 bg-black/5 rounded" />{" "}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0 mt-2">
        <div className="h-10 w-full bg-black/5 rounded" />
      </div>
    </Skeleton>
  );
}

// Grilla de skeletons
export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
