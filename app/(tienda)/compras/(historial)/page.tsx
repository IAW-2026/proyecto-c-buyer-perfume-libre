import Link from "next/link";
import { OrdenAgrupada } from "@/schema/perfume.schema";
import HeaderCompra from "@/components/compras/HeaderCompra";
import ProductoCompra from "@/components/compras/ProductoCompra";
import EstadoVacioCompras from "@/components/compras/EstadoVacioCompras";
import { obtenerHistorialDelUsuario } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis Compras - Perfume Libre",
  description: "Historial de compras del usuario",
};

export default async function MisComprasPage() {
  const itemsComprados = await obtenerHistorialDelUsuario();

  return (
    <div className="w-full bg-background flex flex-col flex-1">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex flex-col flex-1">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground shrink-0">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Mis Compras</span>
        </nav>

        {itemsComprados ? (
          <HistorialCompras ordenes={itemsComprados} />
        ) : (
          <div className="flex flex-1 items-center justify-center pb-8 md:pb-12">
            <EstadoVacioCompras />
          </div>
        )}
      </main>
    </div>
  );
}

export function HistorialCompras({ ordenes }: { ordenes: OrdenAgrupada[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[clamp(28px,4vw,36px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
          Historial de Pedidos
        </h1>
        <p className="mt-2 text-[14px] font-light text-muted-foreground">
          Revisa el estado y detalle de tus adquisiciones recientes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {ordenes.map((orden) => (
          <div
            key={orden.ordenId}
            className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(28,21,16,0.06)]"
          >
            <HeaderCompra
              fecha={orden.fecha}
              estado={orden.estado}
              cantidadProductos={orden.productosComprados}
            />

            <div className="divide-y divide-border/40">
              {orden.items.map((item) => (
                <ProductoCompra
                  key={item.itemId}
                  item={item}
                  ordenId={orden.ordenId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
