import { Skeleton } from "@/components/ui/skeleton";

export function SidebarFiltrosSkeleton() {
  return (
    <aside className="w-64 shrink-0 hidden md:block border-r pr-2 h-[calc(100vh-160px)] overflow-y-auto sticky top-24 pb-16">
      {/* Título de Filtros */}
      <div className="pl-2 mb-4">
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>

      <div className="space-y-1 pl-2">
        {/* Simulación de 4 secciones de filtros */}
        {Array.from({ length: 4 }).map((_, index) => (
          <ItemSkeleton key={index} />
        ))}
      </div>
    </aside>
  );
}

function ItemSkeleton() {
  return (
    <div className="border-b py-4">
      <div className="flex justify-between items-center mb-1">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}
