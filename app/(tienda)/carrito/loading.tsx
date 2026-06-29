import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCarrito() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Skeleton de nav */}
        <Skeleton className="mb-6 h-3 w-32 bg-secondary/80 rounded-sm" />

        {/* Skeleton del Encabezado */}
        <div className="mb-10">
          <Skeleton className="h-10 md:h-12 w-48 md:w-64 bg-secondary/80 rounded-sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* LADO IZQUIERDO: Items del carrito */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Simulamos 2 productos cargando */}
            <SkeletonCartItem />
            <SkeletonCartItem />
          </div>

          {/* Resumen de compra */}
          <SkeletonResumenCompra />
        </div>
      </main>
    </div>
  );
}

function SkeletonCartItem() {
  return (
    <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm">
      <div className="p-0 flex flex-col sm:flex-row items-center sm:items-stretch">
        {/* Skeleton de la Imagen */}
        <Skeleton className="relative w-full sm:w-32 shrink-0 aspect-3/4 sm:aspect-auto sm:min-h-40 bg-secondary/80 rounded-none border-b sm:border-b-0 sm:border-r border-border/40" />

        <div className="flex flex-col flex-1 justify-between p-5 sm:p-6 w-full">
          <div className="flex justify-between items-start gap-4">
            <div className="text-left w-full space-y-2.5">
              {/* Nombre del perfume */}
              <Skeleton className="h-6 w-3/4 sm:w-1/2 bg-secondary/80 rounded-sm" />
              {/* Vendido por */}
              <Skeleton className="h-3 w-32 bg-secondary/50 rounded-sm" />
            </div>

            {/* Botón Eliminar */}
            <Skeleton className="h-8 w-8 shrink-0 bg-secondary/80 rounded-sm" />
          </div>

          {/* Controles Inferiores */}
          <div className="flex justify-between items-end mt-6">
            {/* Selector de cantidad */}
            <Skeleton className="h-9 w-24 bg-secondary/80 rounded-sm" />
            {/* Precio */}
            <Skeleton className="h-6 w-24 bg-secondary/80 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonResumenCompra() {
  return (
    <div className="lg:col-span-4">
      <div className="sticky top-24 rounded-sm border border-border/60 bg-card shadow-sm p-6">
        {/* Título */}
        <Skeleton className="h-4 w-32 mb-6 bg-secondary/80 rounded-sm" />

        <div className="space-y-4">
          {/* Líneas de productos */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-3/5 bg-secondary/50 rounded-sm" />
              <Skeleton className="h-3.5 w-16 bg-secondary/80 rounded-sm" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-1/2 bg-secondary/50 rounded-sm" />
              <Skeleton className="h-3.5 w-16 bg-secondary/80 rounded-sm" />
            </div>
          </div>

          {/* Separador */}
          <div className="my-4 border-t border-border/60" />

          {/* Total */}
          <div className="flex justify-between items-baseline">
            <Skeleton className="h-3.5 w-16 bg-secondary/80 rounded-sm" />
            <Skeleton className="h-8 w-28 bg-secondary/80 rounded-sm" />
          </div>

          {/* Botón Continuar Compra */}
          <Skeleton className="w-full mt-6 h-14 rounded-sm bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
