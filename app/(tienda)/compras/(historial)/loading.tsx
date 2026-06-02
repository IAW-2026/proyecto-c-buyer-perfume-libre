import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCompras() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-6">
          {/* Título de la página */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Tarjeta de compra simulada 1 */}
          <SkeletonOrden />

          {/* Tarjeta de compra simulada 2 */}
          <SkeletonOrden />
        </div>
      </main>
    </div>
  );
}

function SkeletonOrden() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header de la orden */}
      <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" /> {/* Fecha */}
          </div>
          <Skeleton className="h-6 w-24 rounded-full" /> {/* Badge de estado */}
        </div>
      </div>

      {/* Producto */}
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:px-6">
        {/* Imagen */}
        <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />

        {/* Info del producto */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-5 w-3/4 md:w-64" /> {/* Nombre */}
            <Skeleton className="h-4 w-32" /> {/* Vendedor */}
            <Skeleton className="h-3 w-20" /> {/* Unidades */}
          </div>

          {/* Botón ver detalle */}
          <Skeleton className="h-9 w-28 rounded-md shrink-0" />
        </div>
      </div>
    </div>
  );
}
