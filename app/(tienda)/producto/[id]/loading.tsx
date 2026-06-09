// app/producto/[id]/loading-producto.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducto() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LADO IZQUIERDO: Skeleton de la Imagen */}
          <div className="lg:col-span-6 relative bg-slate-50 rounded-2xl border border-slate-200/50 overflow-hidden h-fit lg:sticky lg:top-24">
            <div className="relative aspect-square lg:aspect-4/5 lg:max-h-[75vh] w-full">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          </div>

          {/* LADO DERECHO: Skeleton de la Información */}
          <div className="lg:col-span-6 flex flex-col gap-4 lg:gap-5 h-fit">
            {/* Encabezado */}
            <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
              <Skeleton className="h-4 w-24 mb-1" /> {/* Marca */}
              <Skeleton className="h-10 md:h-12 w-5/6" />{" "}
              {/* Nombre producto */}
              <Skeleton className="h-5 w-40 mt-3" /> {/* Estrellas */}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-2 py-3">
              <Skeleton className="h-14 w-48" />
            </div>

            {/* Vendedor */}
            <div className="flex flex-col gap-2 py-2">
              <Skeleton className="h-4 w-56" />
            </div>

            {/* Detalles (Tamaño y Género) */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>

            {/* Acciones (Botones de compra) */}
            <div className="flex flex-col gap-3 py-4 border-y border-slate-200">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md border-2 bg-transparent" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
