import ProductCard from "@/components/home/productCard";
import { obtenerCatalogo } from "@/lib/api";

export default async function ProductGrid() {
  const perfumes = await obtenerCatalogo();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {perfumes.map((perfume) => (
        <ProductCard key={perfume.id} {...perfume} />
      ))}
    </div>
  );
}
