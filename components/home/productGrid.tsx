import ProductCard from "@/components/home/productCard";
import { getPerfumes } from "@/lib/data";

export default async function ProductGrid() {
  const perfumes = await getPerfumes();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {perfumes.map((perfume) => (
        <ProductCard key={perfume.id} {...perfume} />
      ))}
    </div>
  );
}
