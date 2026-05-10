import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generarUrl, formatearPrecio } from "@/lib/utils";
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CarritoPage() {
  // Datos ficticios para la simulación cambiar por fetch a la db
  const PRODUCTOS_CARRITO = [
    {
      id: "3",
      nombre: "Carolina Herrera Good Girl",
      precio: 112.99,
      imagenUrl:
        "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cantidad: 2,
      vendedor: "Carolina Herrera",
    },
    {
      id: "9",
      nombre: "Tom Ford Black Orchid",
      precio: 189.99,
      imagenUrl:
        "https://images.unsplash.com/photo-1642698215110-87817f1fbe0e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cantidad: 1,
      vendedor: "Tom Ford",
    },
    {
      id: "6",
      nombre: "Hugo Boss Bottled",
      precio: 69.99,
      imagenUrl:
        "https://images.unsplash.com/photo-1638551442447-085a2d42918f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      marca: "Hugo Boss",
      cantidad: 1,
      vendedor: "Hugo Boss",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Carrito de compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <PerfumesEnCarrito Productos={PRODUCTOS_CARRITO} />

          <ResumenCompra Productos={PRODUCTOS_CARRITO} />
        </div>
      </main>
    </div>
  );
}

function PerfumesEnCarrito({ Productos }: { Productos?: any }) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-4">
      {Productos.length > 0 ? (
        Productos.map((producto: any) => (
          <ProductInfo key={producto.id} producto={producto} />
        ))
      ) : (
        <CarritoVacio />
      )}
    </div>
  );
}

function ResumenCompra({ Productos }: { Productos?: any }) {
  const total = calcularTotal(Productos);

  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-24 border-none shadow-sm h-fit">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Resumen de compra</h2>

          <div className="space-y-3">
            <ResumenProductos Productos={Productos} />

            <Separator className="my-4" />

            <ResumenTotal total={total} />

            <BotonContinuarCompra />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProductInfo({ producto }: { producto: any }) {
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
              <SelectorDeCantidad cantidad={producto.cantidad} />

              <ProductPrecio
                precio={producto.precio}
                cantidad={producto.cantidad}
              />
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

function ResumenProductos({ Productos }: { Productos: any[] }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {Productos.map((prod) => (
        <div className="flex justify-between items-start gap-2" key={prod.id}>
          <span>{`${prod.nombre} `}</span>
          <span>{formatearPrecio(prod.precio, prod.cantidad)}</span>
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

function calcularTotal(
  Productos: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl: string;
    cantidad: number;
    vendedor: string;
  }[],
) {
  const subtotal = Productos.reduce(
    (acc, prod) => acc + prod.precio * prod.cantidad,
    0,
  );
  const total = subtotal;
  return total;
}
