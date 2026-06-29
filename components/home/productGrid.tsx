import ProductCard from "@/components/home/productCard";
import { obtenerCatalogo } from "@/lib/api";
import Paginador from "./paginador";

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

  return (
    <div className="w-full min-w-0 space-y-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-x-6">
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
