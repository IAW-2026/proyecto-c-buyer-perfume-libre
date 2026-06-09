import HeroBanner from "@/components/home/HeroBanner";
import TiendaCatalogoClient from "../../components/home/tiendaCatalogoClient";
import ProductGrid from "@/components/home/productGrid";
import ProductGridSkeleton from "@/components/home/productSkeleton";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata = {
  title: "Perfume Libre",
  description: "Explora nuestra tienda online de perfumes",
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const suspenseKey = new URLSearchParams(
    params as Record<string, string>,
  ).toString();

  return (
    <main className="container mx-auto px-4">
      <HeroBanner />

      <TiendaCatalogoClient>
        <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={params} />
        </Suspense>
      </TiendaCatalogoClient>
    </main>
  );
}
