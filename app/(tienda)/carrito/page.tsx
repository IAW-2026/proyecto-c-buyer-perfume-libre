import { obtenerCarritoDelUsuario } from "@/actions/carrito";
import { CarritoWrapper } from "@/components/carrito/carritoWrapper";
import Header from "@/components/layout/header";
import { obtenerProductosCarrito } from "@/lib/api";
import { ItemCarrito, PerfumeCarrito } from "@/schema/perfume.schema";
import Link from "next/link";

// TODO: Agregar skeleton mientras se cargan los productos del carrito

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const productosCarritoDb = await obtenerCarritoDelUsuario();

  if (productosCarritoDb.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <CarritoVacio />
      </div>
    );
  }

  const productosCarritoId = productosCarritoDb.map((item) => item.productoId);
  const productosCarritoDetalle =
    await obtenerProductosCarrito(productosCarritoId);

  const itemsCarrito = fusionarCarritoConDetalles(
    productosCarritoDb,
    productosCarritoDetalle,
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Carrito de compras</h1>
        <CarritoWrapper productosIniciales={itemsCarrito} />
      </main>
    </div>
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

function fusionarCarritoConDetalles(
  carritoDb: { productoId: string; cantidad: number }[],
  productoDetalle: PerfumeCarrito[],
): ItemCarrito[] {
  const diccionarioCantidades = new Map(
    carritoDb.map((item) => [item.productoId, item.cantidad]),
  );

  const carritoFusionado = productoDetalle.map((producto) => {
    return {
      ...producto,
      cantidad: diccionarioCantidades.get(producto.id) || 1,
    };
  });

  return carritoFusionado;
}
