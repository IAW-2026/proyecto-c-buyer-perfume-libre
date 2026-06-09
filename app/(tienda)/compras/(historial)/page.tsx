import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { obtenerProductosComprados } from "@/lib/api";
import {
  COLOR_ESTADOS,
  EstadoOrdenType,
  ItemOrdenDetalle,
  OrdenAgrupada,
  OrdenDeCompraDb,
  OrdenDeCompraDbSchema,
  PerfumeComprado,
} from "@/schema/perfume.schema";
import z from "zod";
import { obtenerComprasDelUsuario } from "@/actions/compras";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MisComprasPage() {
  const itemsComprados = await obtenerHistorialDelUsuario();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Mis Compras</span>
        </nav>

        {itemsComprados ? (
          <HistorialCompras ordenes={itemsComprados} />
        ) : (
          <EstadoVacioCompras />
        )}
      </main>
    </div>
  );
}

function EstadoVacioCompras() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-border/50 bg-card px-6 py-20 text-center shadow-sm">
      <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal text-foreground mb-3">
        Aún no tienes compras
      </h2>
      <p className="mx-auto max-w-md text-[14px] font-light text-muted-foreground leading-relaxed">
        Cuando realices tu primera adquisición, aquí podrás hacer el seguimiento
        y ver el detalle de cada pedido.
      </p>
      <div className="mt-8">
        <Link
          href="/?page=1"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-12 px-8 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all",
          )}
        >
          Explorar fragancias
        </Link>
      </div>
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
        <p className="mt-2 text-[14px] text-muted-foreground">
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

function HeaderCompra({
  fecha,
  estado,
  cantidadProductos,
}: {
  fecha: Date;
  estado: EstadoOrdenType;
  cantidadProductos: number;
}) {
  return (
    <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">
            {format(fecha, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <span className="hidden sm:inline text-muted-foreground/50">|</span>
          <p className="text-[12px] font-medium text-muted-foreground">
            {cantidadProductos}{" "}
            {cantidadProductos === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div>
          <Badge
            className={cn(
              COLOR_ESTADOS[estado],
              "uppercase tracking-widest text-[10px] rounded-sm px-2.5 py-0.5",
            )}
            variant="secondary"
          >
            {estado}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ProductoCompra({
  item,
  ordenId,
}: {
  item: ItemOrdenDetalle;
  ordenId: string;
}) {
  return (
    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
      <div className="relative w-20 shrink-0 aspect-3/4 overflow-hidden rounded-sm bg-secondary border border-border/30">
        <Image
          src={item.imagenUrl}
          alt={item.nombre}
          fill
          sizes="80px"
          className="object-cover mix-blend-multiply"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DetallesProducto
          nombre={item.nombre}
          vendedor={item.vendedor}
          cantidad={item.cantidad}
        />

        <div className="shrink-0">
          <Link
            href={`/compras/${ordenId}?itemId=${item.itemId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 px-4 text-[10px] uppercase tracking-widest font-bold border border-border bg-transparent text-foreground hover:border-accent hover:text-accent transition-all rounded-sm w-full sm:w-auto",
            )}
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetallesProducto({
  nombre,
  vendedor,
  cantidad,
}: {
  nombre: string;
  vendedor: string;
  cantidad: number;
}) {
  return (
    <div className="flex min-w-0 flex-col grow">
      <h4 className="font-serif text-[18px] text-foreground line-clamp-1">
        {nombre}
      </h4>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        Vendedor:{" "}
        <span className="font-semibold text-foreground/80">{vendedor}</span>
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {cantidad > 1 ? `Unidades: ${cantidad}` : `Unidad: ${cantidad}`}
      </p>
    </div>
  );
}

// ... Las funciones fusionarCompradoConDetalles y obtenerHistorialDelUsuario siguen igual
function fusionarCompradoConDetalles(
  compradoDb: OrdenDeCompraDb[],
  productoDetalle: PerfumeComprado[],
): OrdenAgrupada[] {
  const detallesMap = new Map(
    productoDetalle.map((producto) => [producto.id, producto]),
  );

  const historialAgrupado: OrdenAgrupada[] = compradoDb.map((orden) => {
    const itemsProcesados: ItemOrdenDetalle[] = orden.items.map((item) => {
      const detalleCatálogo = detallesMap.get(item.productoId);
      return {
        itemId: item.id,
        productoId: item.productoId,
        nombre: detalleCatálogo?.nombre ?? "Producto no disponible",
        vendedor: detalleCatálogo?.vendedor ?? "Desconocido",
        imagenUrl: detalleCatálogo?.imagenUrl ?? "/placeholder-perfume.jpg",
        precioHistorico: item.precio,
        cantidad: item.cantidad,
      };
    });

    const productosComprados = orden.items.reduce(
      (acc, item) => acc + item.cantidad,
      0,
    );

    return {
      ordenId: orden.id,
      fecha: orden.createdAt,
      estado: orden.estado,
      items: itemsProcesados,
      productosComprados: productosComprados,
    };
  });

  return historialAgrupado;
}

async function obtenerHistorialDelUsuario() {
  const obtenerComprasDb = await obtenerComprasDelUsuario();

  const obtenerComprasDbValidado = z
    .array(OrdenDeCompraDbSchema)
    .parse(obtenerComprasDb);

  if (obtenerComprasDbValidado.length === 0) {
    return null;
  }

  const perfumesCompradosId = obtenerIdComprados(obtenerComprasDbValidado);

  const detallePerfumesComprados =
    await obtenerProductosComprados(perfumesCompradosId);

  return fusionarCompradoConDetalles(
    obtenerComprasDbValidado,
    detallePerfumesComprados,
  );
}

function obtenerIdComprados(comprasDb: OrdenDeCompraDb[]): string[] {
  return comprasDb.flatMap((orden) =>
    orden.items.map((item) => item.productoId),
  );
}
