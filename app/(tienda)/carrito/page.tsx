import { obtenerCarritoDelUsuario } from "@/actions/carrito";
import CarritoVacio from "@/components/carrito/CarritoVacio";
import { CarritoWrapper } from "@/components/carrito/carritoWrapper";
import { obtenerProductosCarrito } from "@/lib/api";
import { ItemCarrito, PerfumeCarrito } from "@/schema/perfume.schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrito de Compras - Perfume Libre",
  description: "Revisa los productos que has agregado a tu carrito",
};

export default async function CarritoPage() {
  const productosCarritoDb = await obtenerCarritoDelUsuario();

  if (productosCarritoDb.length === 0) {
    return (
      <div className="bg-background">
        <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Carrito</span>
          </nav>

          <div className="mb-10">
            <h1 className="text-[clamp(28px,4vw,36px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
              Tu Carrito
            </h1>
          </div>

          <CarritoVacio />
        </main>
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
    <div className="bg-background">
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Carrito</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-[clamp(28px,4vw,36px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
            Tu Carrito
          </h1>
        </div>

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
