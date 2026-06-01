import Header from "@/components/layout/header";
import ProductGrid from "@/components/home/productGrid";
import ProductGridSkeleton from "@/components/home/productSkeleton";
import SidebarFiltros from "@/components/home/sidebarFiltros";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const suspenseKey = new URLSearchParams(
    params as Record<string, string>,
  ).toString();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto flex gap-6 px-4 md:px-8 py-8">
        <SidebarFiltros />

        <main className="flex-1">
          <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={params} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
