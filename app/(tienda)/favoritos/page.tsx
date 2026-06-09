import { obtenerFavoritosDelUsuario } from "@/actions/favoritos";
import ListaFavoritos from "@/components/favoritos/ListaFavoritos";
import { obtenerProductosFavoritos } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Favoritos",
  description: "Lista de perfumes favoritos del usuario",
};

export default async function FavoritosPage() {
  const obtenerIdsFavoritos = await obtenerFavoritosDelUsuario();
  const perfumesFavoritos =
    await obtenerProductosFavoritos(obtenerIdsFavoritos);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Favoritos</h1>

        <ListaFavoritos favoritosIniciales={perfumesFavoritos} />
      </main>
    </div>
  );
}
