import Header from "@/components/layout/header";
import ProductGrid from "@/components/home/productGrid";
import ProductGridSkeleton from "@/components/home/productSkeleton";
import SidebarFiltros from "@/components/home/sidebarFiltros";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="container mx-auto flex gap-6 px-4 md:px-8 py-8">
        <SidebarFiltros />

        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
