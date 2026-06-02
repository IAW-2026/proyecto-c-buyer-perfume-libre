import ProductCard from "@/components/home/productCard";
import { obtenerCatalogo } from "@/lib/api";
import Paginador from "./paginador";

export default async function ProductGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;

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
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {items.map((perfume) => (
          <ProductCard key={perfume.id} {...perfume} />
        ))}
      </div>

      <div className="flex justify-center border-t pt-8">
        <Paginador total={total} limite={limit} paginaActual={page} />
      </div>
    </div>
  );
}
