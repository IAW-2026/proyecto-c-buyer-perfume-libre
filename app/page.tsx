import Header from "@/components/home/header";
import ProductCard from "@/components/home/productCard";
import ProductGrid from "@/components/home/productGrid";
import SidebarFiltros from "@/components/home/sidebarFiltros";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="container mx-auto flex gap-6 px-4 md:px-8 py-8">
        <SidebarFiltros />

        <main className="flex-1">
          <Suspense fallback={<p>Cargando fragancias...</p>}>
            <ProductGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
