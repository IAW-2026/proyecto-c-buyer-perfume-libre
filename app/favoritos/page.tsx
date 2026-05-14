import { obtenerFavoritosDelUsuario } from "@/actions/favoritos";
import ProductoCardFavoritos from "@/components/favoritos/ProductCardFavoritos";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { obtenerProductosFavoritos } from "@/lib/api";
import Link from "next/link";

// TODO: Agregar skeleton mientras se cargan los favoritos
export default async function FavoritosPage() {
  const obtenerIdsFavoritos = await obtenerFavoritosDelUsuario();
  const perfumesFavoritos =
    await obtenerProductosFavoritos(obtenerIdsFavoritos);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Favoritos</h1>

        <div className="flex flex-col gap-4">
          {perfumesFavoritos.length > 0 ? (
            perfumesFavoritos.map((producto) => (
              <ProductoCardFavoritos key={producto.id} producto={producto} />
            ))
          ) : (
            <FavoritosVacio />
          )}
        </div>
      </main>
    </div>
  );
}

function FavoritosVacio() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <p className="text-muted-foreground mb-4">
        No tenés productos guardados como favoritos.
      </p>
      <Button>
        <Link href="/">Explorar perfumes</Link>
      </Button>
    </div>
  );
}
