import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Datos ficticios para simular favoritos
const FAVORITOS_MOCK = [
  {
    id: "1",
    nombre: "Sauvage Elixir - Dior 60ml",
    precio: 185000,
    imagenUrl:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=200",
    marca: "Dior",
  },
  {
    id: "3",
    nombre: "Carolina Herrera Good Girl",
    precio: 112.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Carolina Herrera",
  },
  {
    id: "10",
    nombre: "Dolce & Gabbana Light Blue",
    precio: 84.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1720414913669-87031493d7c9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Dolce & Gabbana",
  },
];

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Favoritos</h1>

        <div className="flex flex-col gap-4">
          {FAVORITOS_MOCK.length > 0 ? (
            FAVORITOS_MOCK.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))
          ) : (
            <FavoritosVacio />
          )}
        </div>
      </main>
    </div>
  );
}

function ProductoCard({ producto }: { producto: any }) {
  return (
    <Card
      key={producto.id}
      className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow"
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch">
          <ProductImage
            imagenUrl={producto.imagenUrl}
            nombre={producto.nombre}
          />

          <ProductInfo
            marca={producto.marca}
            nombre={producto.nombre}
            precio={producto.precio}
          />

          <ProductAgregarCarrito />
        </div>
      </CardContent>
    </Card>
  );
}

function FavoritosVacio() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <p className="text-muted-foreground mb-4">
        No tenés productos guardados como favoritos.
      </p>
      <Button>
        <Link href="/">Explorar perfumes</Link>
      </Button>
    </div>
  );
}

function ProductImage({
  imagenUrl,
  nombre,
}: {
  imagenUrl: string;
  nombre: string;
}) {
  return (
    <div className="relative h-40 w-40 p-4 shrink-0 flex items-center justify-center bg-white border-r border-slate-100">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
    </div>
  );
}

function ProductInfo({
  marca,
  nombre,
  precio,
}: {
  marca: string;
  nombre: string;
  precio: number;
}) {
  return (
    <div className="flex flex-col flex-1 p-6 justify-between text-center sm:text-left">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
          {marca}
        </span>
        <Link href={`/producto/`}>
          <h3 className="text-lg font-medium text-foreground hover:text-blue-600 transition-colors leading-tight">
            {nombre}
          </h3>
        </Link>
        <div className="mt-2 flex flex-col">
          <span className="text-2xl font-semibold text-foreground">
            {formatearPrecio(precio)}
          </span>
        </div>
      </div>

      <ProductActions />
    </div>
  );
}

function ProductActions() {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-4 mt-6 sm:mt-0">
      <Button
        variant="link"
        className="text-blue-500 p-0 h-auto font-medium hover:text-blue-700"
      >
        Eliminar
      </Button>
      <div className="w-px h-4 bg-slate-200 hidden sm:block" />
      <Button
        variant="link"
        className="text-blue-500 p-0 h-auto font-medium hover:text-blue-700"
      >
        Comprar ahora
      </Button>
    </div>
  );
}

function ProductAgregarCarrito() {
  return (
    <div className="p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-100">
      <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
        <ShoppingCart className="h-4 w-4" />
        Agregar al carrito
      </Button>
    </div>
  );
}
