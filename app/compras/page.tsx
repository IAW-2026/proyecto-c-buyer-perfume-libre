import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, CandlestickChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { vendored } from "next/dist/server/route-modules/app-page/module.compiled";

// Mock de compras realizadas
const COMPRAS_MOCK = [
  {
    id: "8",
    fecha: "28 de abril",
    estado: "Entregado",
    nombre: "Calvin Klein CK One",
    vendedor: "PerfumeLibre Oficial",
    imagenUrl:
      "https://images.unsplash.com/photo-1620848616916-3efaf499adcb?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cantidad: 1,
  },
  {
    id: "3",
    fecha: "15 de abril",
    estado: "Entregado",
    nombre: "Carolina Herrera Good Girl",
    vendedor: "Fragancias Premium",
    imagenUrl:
      "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cantidad: 1,
  },
  {
    id: "11",
    fecha: "10 de abril",
    estado: "En camino",
    nombre: "Yves Saint Laurent Libre",
    vendedor: "PerfumeLibre Oficial",
    imagenUrl:
      "https://images.unsplash.com/photo-1723391962166-6d9bb8a3d3e7?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cantidad: 3,
  },
];

export default function MisComprasPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Mis compras</h1>

        <div className="flex flex-col gap-6">
          {COMPRAS_MOCK.map((compra) => (
            <CompraItem key={compra.id} {...compra} />
          ))}
        </div>

        {COMPRAS_MOCK.length === 0 && <ComprasVacias />}
      </main>
    </div>
  );

  function CompraItem(compra: {
    id: string;
    fecha: string;
    estado: string;
    nombre: string;
    vendedor: string;
    imagenUrl: string;
    cantidad: number;
  }) {
    return (
      <div key={compra.id} className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted-foreground ml-1">
          {compra.fecha}
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
                  estado={compra.estado}
                  nombre={compra.nombre}
                  vendedor={compra.vendedor}
                  cantidad={compra.cantidad}
                />
              </div>

              <PurchaseActions />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
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
