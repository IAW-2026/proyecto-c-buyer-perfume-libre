import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBag, MapPin, Truck, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";

// Pequeña función utilitaria para formatear la plata (en centavos)
function formatearPrecio(centavos: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(centavos / 100);
}

type Props = {
  // Next.js nos da searchParams automáticamente en las Pages
  searchParams: Promise<{ ordenId?: string }>;
};

export default async function ConfirmacionCheckoutPage({
  searchParams,
}: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Esperamos los query params (en Next.js 15+ se manejan como Promise)
  const { ordenId } = await searchParams;

  if (!ordenId) {
    redirect("/carrito"); // Si entraron a mano sin ID, los mandamos al carrito
  }

  // 1. Buscamos la orden pendiente en nuestra DB
  const orden = await prisma.ordenCompra.findUnique({
    where: { id: ordenId, usuarioId: userId },
    include: {
      items: true, // Traemos los renglones de los perfumes comprados
    },
  });

  // Seguridad: Si la orden no existe o ya no está pendiente, rebote
  if (!orden || orden.estado !== "Pendiente") {
    redirect("/carrito");
  }

  // 2. Buscamos los datos de la dirección para mostrárselos al usuario
  // (Aunque te abstraigas para Shipping, acá nos sirve para mostrar el texto en pantalla)

  // 3. Calculamos el subtotal de productos sumando los items de la orden
  const subtotalProductos = orden.items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-950 mb-2">
          Revisá tu compra
        </h1>
        <p className="text-slate-500 mb-8">
          Confirmá que todo esté correcto antes de realizar el pago.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA: DETALLES (2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* TARJETA 1: DESTINO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <MapPin className="w-4 h-4 text-blue-600" /> Formas de entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">
                    Enviar a domicilio
                  </p>
                  <p>
                    {"Av. San martin"} {"128"} {"3B - $4000"}
                  </p>
                  <p className="text-xs text-slate-400">
                    CP {"800"} - {"ad"}, {"prov"}
                  </p>
                  <p className="text-xs text-slate-400">Recibe: {"martin"}</p>
                </div>
              </CardContent>
            </Card>

            {/* TARJETA 2: PRODUCTOS CONGELADOS */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <ShoppingBag className="w-4 h-4 text-blue-600" /> Productos
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y text-sm">
                {orden.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex justify-between items-center first:pt-0 last:pb-0"
                  >
                    <div>
                      {/* En etapa 3 acá harías el fetch a la Seller App para tener el Nombre del perfume */}
                      <p className="font-medium text-slate-900">
                        Perfume ID: {item.productoId}
                      </p>
                      <p className="text-xs text-slate-400">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <span className="font-mono font-medium text-slate-900">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DE COSTOS (1/3) */}
          <div className="space-y-6">
            <Card className="border-blue-100 shadow-sm bg-white sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Resumen de compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Productos</span>
                  <span className="font-mono">
                    {formatearPrecio(subtotalProductos)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Envío
                  </span>
                  <span className="font-mono">
                    {formatearPrecio(orden.costoEnvio)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-slate-900">
                    Total a pagar
                  </span>
                  <span className="text-2xl font-extrabold text-blue-600 font-mono">
                    {formatearPrecio(orden.total)}
                  </span>
                </div>

                {/* BOTÓN CRÍTICO: DETONADOR DE LA PASARELA */}
                <div className="pt-4">
                  <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <CreditCard className="w-4 h-4 mr-2" /> Continuar al pago
                  </Button>
                </div>

                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Al continuar serás redirigido de forma segura a la Payments
                  App corporativa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
