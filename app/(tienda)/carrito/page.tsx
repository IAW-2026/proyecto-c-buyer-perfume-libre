import { obtenerCarritoDelUsuario } from "@/actions/carrito";
import CarritoVacio from "@/components/carrito/CarritoVacio";
import { CarritoWrapper } from "@/components/carrito/carritoWrapper";
import { obtenerProductosCarrito } from "@/lib/api";
import { ItemCarrito, PerfumeCarrito } from "@/schema/perfume.schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrito de Compras",
  description: "Revisa los productos que has agregado a tu carrito",
};

export default async function CarritoPage() {
  const productosCarritoDb = await obtenerCarritoDelUsuario();

  if (productosCarritoDb.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">Carrito de compras</h1>
        <CarritoWrapper productosIniciales={itemsCarrito} />
      </main>
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
