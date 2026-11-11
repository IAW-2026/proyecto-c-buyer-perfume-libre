import ProductCard from "@/components/home/productCard";
import { obtenerCatalogo } from "@/lib/api";
import Paginador from "./paginador";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default async function ProductGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 15;

  const { items, total } = await obtenerCatalogo({
    q: searchParams.q,
    marca: searchParams.marca,
    genero: searchParams.genero,
    tamano: searchParams.tamano,
    precioMin: searchParams.precioMin,
    precioMax: searchParams.precioMax,
    page,
    limit,
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-24 text-center animate-in fade-in duration-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          No encontramos ningún perfume
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          No hay productos que coincidan con los filtros seleccionados. Intenta
          ajustarlos, cambiar las categorías o realizar una nueva búsqueda.
        </p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Limpiar filtros
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 lg:gap-x-6">
        {items.map((perfume) => (
          <ProductCard key={perfume.id} {...perfume} />
        ))}
      </div>

      <div className="flex justify-center border-t border-border pt-4 pb-4">
        <Paginador total={total} limite={limit} paginaActual={page} />
      </div>
    </div>
  );
}
