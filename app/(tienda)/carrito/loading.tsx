import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoadingCarrito() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Carrito de compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items del carrito */}
          <div className="lg:col-span-8 flex flex-col gap-4">
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
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4 md:gap-6">
          {/* Imagen del perfume */}
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-md" />

          {/* Detalles del producto */}
          <div className="flex flex-col flex-1 justify-between py-1">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4 md:w-1/2" /> {/* Nombre */}
                <Skeleton className="h-4 w-1/3" /> {/* Vendedor */}
              </div>
            </div>

            <div className="flex justify-between items-end mt-4">
              <Skeleton className="h-9 w-28 rounded-md" /> {/* Botones + / - */}
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-6 w-24" /> {/* Precio Total del item */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonResumenCompra() {
  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-24 border-none shadow-sm h-fit">
        <div className="p-6">
          {/* Título del resumen */}
          <Skeleton className="h-7 w-48 mb-4" />

          <div className="space-y-3">
            {/* Lista de productos con 2 filas */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Separador */}
            <Separator className="my-4" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" /> {/* Subtotal */}
              <Skeleton className="h-7 w-28" /> {/* Monto */}
            </div>

            {/* Botón de continuar compra */}
            <Skeleton className="h-11 w-full mt-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
