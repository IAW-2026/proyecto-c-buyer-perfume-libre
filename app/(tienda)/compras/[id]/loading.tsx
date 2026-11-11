import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDetalleCompra() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-8">
        {/* Botón Volver */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 bg-secondary/80 rounded-sm" />
        </div>

        {/* Detalle del Pedido */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-9 md:h-11 w-64 md:w-80 bg-secondary/80 rounded-sm mb-4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-32 bg-secondary/50 rounded-sm" />
              <Skeleton className="h-3 w-32 bg-secondary/50 rounded-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Seguimiento de Envío */}
            <div className="rounded-sm border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/30 pb-4 pt-5 px-6 border-b border-border/60 flex justify-between items-center">
                <Skeleton className="h-4 w-40 bg-secondary/80 rounded-sm" />
                <Skeleton className="h-3 w-24 bg-secondary/50 rounded-sm" />
              </div>
              <div className="p-6 pt-8 space-y-8">
                <Skeleton className="h-4 w-48 bg-secondary/80 rounded-sm" />
                {/* Línea de tiempo simulada */}
                <div className="border-l border-border/80 ml-2 pl-8 space-y-8">
                  <div>
                    <Skeleton className="h-3.5 w-3/4 bg-secondary/80 rounded-sm mb-2.5" />
                    <Skeleton className="h-2.5 w-32 bg-secondary/50 rounded-sm" />
                  </div>
                  <div>
                    <Skeleton className="h-3.5 w-1/2 bg-secondary/50 rounded-sm mb-2.5" />
                    <Skeleton className="h-2.5 w-24 bg-secondary/50 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen del Producto */}
            <div className="rounded-sm border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <Skeleton className="h-4 w-36 bg-secondary/80 rounded-sm" />
              </div>
              <div className="p-6 pt-0 flex gap-5 items-center">
                {/* Imagen */}
                <Skeleton className="w-16 sm:w-20 shrink-0 aspect-3/4 bg-secondary/80 rounded-sm" />

                <div className="grow min-w-0 space-y-3">
                  <Skeleton className="h-5 w-3/4 sm:w-64 bg-secondary/80 rounded-sm" />
                  <Skeleton className="h-3 w-32 bg-secondary/50 rounded-sm" />
                  <Skeleton className="h-4 w-40 bg-secondary/80 rounded-sm mt-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Pago */}
          <div className="space-y-6">
            <div className="rounded-sm border border-border/60 bg-card shadow-sm sticky top-24 overflow-hidden">
              <div className="bg-secondary/30 pb-4 pt-5 px-6 border-b border-border/60">
                <Skeleton className="h-4 w-32 bg-secondary/80 rounded-sm" />
              </div>

              <div className="p-6 space-y-4 pt-6">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24 bg-secondary/50 rounded-sm" />
                  <Skeleton className="h-3.5 w-16 bg-secondary/80 rounded-sm" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-12 bg-secondary/50 rounded-sm" />
                  <Skeleton className="h-3.5 w-16 bg-secondary/80 rounded-sm" />
                </div>

                <div className="my-4 border-t border-border/60" />

                <div className="flex justify-between items-baseline">
                  <Skeleton className="h-3.5 w-20 bg-secondary/80 rounded-sm" />
                  <Skeleton className="h-7 w-28 bg-secondary/80 rounded-sm" />
                </div>

                <div className="my-4 border-t border-border/60" />

                <div className="space-y-3">
                  <Skeleton className="h-3.5 w-48 bg-secondary/50 rounded-sm" />
                  <Skeleton className="h-3.5 w-56 bg-secondary/50 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
