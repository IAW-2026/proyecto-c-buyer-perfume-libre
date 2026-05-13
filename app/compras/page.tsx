import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, CandlestickChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { obtenerProductosComprados } from "@/lib/api";
import { PerfumeComprado } from "@/schema/perfume.schema";

export default async function MisComprasPage() {
  // TODO: Cambiar por query a db
  const obtenerIdsCompras = ["1", "2", "3"];
  const perfumesComprados = await obtenerProductosComprados(obtenerIdsCompras);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Mis compras</h1>

        <div className="flex flex-col gap-6">
          {perfumesComprados.map((compra) => (
            <CompraItem key={compra.id} compra={compra} />
          ))}
        </div>

        {perfumesComprados.length === 0 && <ComprasVacias />}
      </main>
    </div>
  );
}

function CompraItem({ compra }: { compra: PerfumeComprado }) {
  return (
    <div key={compra.id} className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted-foreground ml-1">
        {"00/00/000"}{" "}
        {/* TODO: Cambiar por query a db para obtener fecha real de compra */}
      </span>

      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center md:items-stretch">
            <div className="flex items-center gap-4 p-4 md:p-6 flex-1">
              <ProductImagen
                imagenUrl={compra.imagenUrl}
                nombre={compra.nombre}
              />

              <ProductDetalles
                estado={"---"} // TODO: Cambiar por query a db para obtener cantidad real de compra
                nombre={compra.nombre}
                vendedor={compra.vendedor}
                cantidad={0} // TODO: Cambiar por query a db para obtener cantidad real de compra
              />
            </div>

            <PurchaseActions />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductImagen({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative h-20 w-20 shrink-0 border rounded-md overflow-hidden bg-white">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
    </div>
  );
}

function ProductDetalles({
  estado,
  nombre,
  vendedor,
  cantidad,
}: {
  estado: string;
  nombre: string;
  vendedor: string;
  cantidad: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Badge
        className={`w-fit font-semibold ${
          estado === "Entregado"
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
        } border-none shadow-none`}
      >
        {estado}
      </Badge>
      <h3 className="font-medium text-sm md:text-base leading-tight line-clamp-1">
        {nombre}
      </h3>
      <p className="text-xs text-muted-foreground">
        {cantidad} unidad
        {cantidad > 1 ? "es" : ""} • Vendido por{" "}
        <span className="text-foreground font-medium">{vendedor}</span>
      </p>
    </div>
  );
}

function PurchaseActions() {
  return (
    <div className="w-full md:w-auto p-4 md:p-6 flex flex-col md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30 md:bg-transparent">
      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
      >
        Volver a comprar
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-blue-200 text-blue-600 font-bold hover:bg-blue-50"
      >
        Ver compra
      </Button>
    </div>
  );
}

function ComprasVacias() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">
        Todavía no realizaste ninguna compra.
      </p>
      <Button>
        <Link href="/">Empezar a comprar</Link>
      </Button>
    </div>
  );
}
