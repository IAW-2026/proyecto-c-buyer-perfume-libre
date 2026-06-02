import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoadingDetalleCompra() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="container mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40 rounded-md" /> {/* Botón Volver */}
        </div>

        {/* TÍTULO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" /> {/* "Detalle de la Compra" */}
            <Skeleton className="h-4 w-48" /> {/* Orden ID */}
            <Skeleton className="h-3 w-40" /> {/* Item ID */}
          </div>
        </div>

        {/* PANEL PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado Izquierdo */}
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCardSeguimiento />
            <SkeletonProductCard />
          </div>
          <div className="lg:col-span-1">
            <SkeletonResumenPago />
          </div>
        </div>
      </main>
    </div>
  );
}

function SkeletonCardSeguimiento() {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="bg-slate-50/50 pb-4 border-b flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" /> {/* Icono de camión */}
          <Skeleton className="h-6 w-48" /> {/* "Seguimiento del Envío" */}
        </div>
        <Skeleton className="h-4 w-24" /> {/* "ID Envio " */}
      </CardHeader>
      <CardContent className="pt-6">
        <Skeleton className="h-5 w-48 mb-6" /> {/* Estado actual */}
        {/* Línea de tiempo simulada (3 eventos) */}
        <div className="border-l-2 border-slate-100 ml-2 pl-6 space-y-6">
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-56 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonProductCard() {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" /> {/* "Detalle del Producto" */}
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          {/* Imagen del producto */}
          <Skeleton className="h-20 w-20 rounded-lg shrink-0" />

          {/* Textos del producto */}
          <div className="space-y-2 w-full max-w-sm">
            <Skeleton className="h-5 w-full" /> {/* Nombre */}
            <Skeleton className="h-4 w-32" /> {/* Vendedor */}
            <Skeleton className="h-4 w-48 mt-2" /> {/* Unidades y Precio */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonResumenPago() {
  return (
    <Card className="border-slate-200/80 shadow-sm sticky top-6">
      <CardHeader>
        <Skeleton className="h-6 w-40" /> {/* "Resumen de costos" */}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal y Envío */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>

        <Separator className="my-2" />

        {/* Total */}
        <div className="flex justify-between items-baseline">
          <Skeleton className="h-5 w-24" /> {/* Total */}
          <Skeleton className="h-7 w-24" /> {/* Monto */}
        </div>

        <Separator className="my-2" />

        {/* Datos de Transacción */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" /> {/* Icono */}
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" /> {/* Icono */}
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
