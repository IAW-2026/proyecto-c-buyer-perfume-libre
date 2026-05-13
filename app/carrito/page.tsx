import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { obtenerProductosCarrito } from "@/lib/api";
import { generarUrl, formatearPrecio } from "@/lib/utils";
import { PerfumeCarrito } from "@/schema/perfume.schema";
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// TODO: Agregar skeleton mientras se cargan los productos del carrito
export default async function CarritoPage() {
  // TODO: Remplazar por query a la db
  const productosEnCarritoId = [] as any;
  const productosEnCarrito =
    await obtenerProductosCarrito(productosEnCarritoId);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Carrito de compras</h1>
        {/* TODO: Manejar cuando el carrito este vacio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <PerfumesEnCarrito productos={productosEnCarrito} />

          <ResumenCompra productos={productosEnCarrito} />
        </div>
      </main>
    </div>
  );
}

function PerfumesEnCarrito({ productos }: { productos: PerfumeCarrito[] }) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-4">
      {productos.length > 0 ? (
        productos.map((producto: PerfumeCarrito) => (
          <ProductInfo key={producto.id} producto={producto} />
        ))
      ) : (
        <CarritoVacio />
      )}
    </div>
  );
}

function ResumenCompra({ productos }: { productos: PerfumeCarrito[] }) {
  const total = calcularTotal(productos);

  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-24 border-none shadow-sm h-fit">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Resumen de compra</h2>

          <div className="space-y-3">
            <ResumenProductos productos={productos} />

            <Separator className="my-4" />

            <ResumenTotal total={total} />

            <BotonContinuarCompra />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProductInfo({ producto }: { producto: PerfumeCarrito }) {
  return (
    <Card key={producto.id} className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4 md:gap-6">
          <ProductImagen
            imagenUrl={producto.imagenUrl}
            nombre={producto.nombre}
          />

          <div className="flex flex-col flex-1 justify-between py-1">
            {/* TODO: Implementar boton de eliminar */}
            <ProductoDetalles
              idProducto={producto.id}
              nombreProducto={producto.nombre}
              vendedor={producto.vendedor}
            />

            <div className="flex justify-between items-end mt-4">
              {/* TODO: Remplazar por query a db */}
              <SelectorDeCantidad cantidad={0} />{" "}
              {/* TODO: Remplazar por query a db */}
              <ProductPrecio precio={producto.precio} cantidad={0} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CarritoVacio() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ir a buscar perfumes
      </Link>
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
    <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 border rounded-md overflow-hidden bg-white">
      <Image src={imagenUrl} alt={nombre} fill className="object-contain p-2" />
    </div>
  );
}

function ProductoDetalles({
  idProducto,
  nombreProducto,
  vendedor,
}: {
  idProducto: string;
  nombreProducto: string;
  vendedor: string;
}) {
  const url = generarUrl(nombreProducto, idProducto);

  return (
    <div className="flex justify-between items-start gap-2">
      <div>
        <Link
          href={`/producto/${url}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="font-medium text-sm md:text-base leading-tight">
            {nombreProducto}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          Vendido por <span className="text-blue-500">{vendedor}</span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SelectorDeCantidad({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex items-center border rounded-md h-9">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-r"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-10 text-center text-sm font-medium">{cantidad}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-l"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ProductPrecio({
  precio,
  cantidad,
}: {
  precio: number;
  cantidad: number;
}) {
  return (
    <div className="text-right">
      <span className="text-lg md:text-xl font-semibold">
        {formatearPrecio(precio, cantidad)}
      </span>
    </div>
  );
}

function ResumenProductos({ productos }: { productos: PerfumeCarrito[] }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {productos.map((prod) => (
        <div className="flex justify-between items-start gap-2" key={prod.id}>
          <span>{`${prod.nombre} `}</span>
          <span>{formatearPrecio(prod.precio, 0)}</span>{" "}
          {/* TODO: Remplazar por query a db */}
        </div>
      ))}
    </div>
  );
}

function ResumenTotal({ total }: { total: number }) {
  return (
    <div className="flex justify-between text-lg font-bold">
      <span>Subtotal</span>
      <span>{formatearPrecio(total)}</span>
    </div>
  );
}

function BotonContinuarCompra() {
  return (
    <Button className="w-full mt-6 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
      Continuar compra
    </Button>
  );
}

function calcularTotal(productos: PerfumeCarrito[]): number {
  {
    /* TODO: Remplazar por query a db */
  }
  const subtotal = productos.reduce((acc, prod) => acc + prod.precio * 0, 0);
  const total = subtotal;
  return total;
}
