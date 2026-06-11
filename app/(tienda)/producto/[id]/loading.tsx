import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducto() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Skeleton de nav*/}
        <Skeleton className="mb-6 h-3 w-48 bg-secondary/80 rounded-sm" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Skeleton de la Imagen */}
          <div className="lg:col-span-6 relative bg-secondary rounded-sm overflow-hidden h-fit lg:sticky lg:top-24">
            <div className="relative aspect-3/4 w-full">
              <Skeleton className="w-full h-full rounded-none bg-secondary/80" />
            </div>
          </div>

          {/* Skeleton de la Información */}
          <div className="lg:col-span-6 flex flex-col pt-4 h-fit">
            {/* 1. Encabezado */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28 bg-secondary/80 rounded-sm" />
              <Skeleton className="h-8 md:h-10 w-4/5 bg-secondary/80 rounded-sm" />
            </div>

            {/* 2. Calificación Estrellas */}
            <Skeleton className="h-5 w-44 mt-3" />

            {/* 3. Precio */}
            <div className="mt-6">
              <Skeleton className="h-8 w-48 bg-secondary/80 rounded-sm" />
            </div>

            {/* 4. Vendedor */}
            <Skeleton className="h-4 w-36 my-4" />

            {/* 5. Detalles */}
            <div className="mt-6 border-y border-border/60 py-5">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Skeleton className="h-2.5 w-16 mb-2.5 bg-secondary/80 rounded-sm" />
                  <Skeleton className="h-5 w-24 bg-secondary/80 rounded-sm" />
                </div>
                <div>
                  <Skeleton className="h-2.5 w-16 mb-2.5 bg-secondary/80 rounded-sm" />
                  <Skeleton className="h-5 w-28 bg-secondary/80 rounded-sm" />
                </div>
              </div>
            </div>

            {/* 6. Acciones */}
            <div className="mt-8 flex flex-col gap-3">
              {/* Botón Comprar Ahora */}
              <Skeleton className="h-14 w-full rounded-sm bg-foreground/10" />
              {/* Botón Agregar al Carrito */}
              <Skeleton className="h-14 w-full rounded-sm border border-border/60 bg-transparent" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
