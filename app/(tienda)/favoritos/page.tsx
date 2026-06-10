import { obtenerFavoritosDelUsuario } from "@/actions/favoritos";
import ListaFavoritos from "@/components/favoritos/ListaFavoritos";
import { obtenerProductosFavoritos } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Favoritos - Perfume Libre",
  description: "Lista de perfumes favoritos del usuario",
};

export default async function FavoritosPage() {
  const obtenerIdsFavoritos = await obtenerFavoritosDelUsuario();
  const perfumesFavoritos =
    await obtenerProductosFavoritos(obtenerIdsFavoritos);

  return (
    <div className="bg-background">
      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Favoritos</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-[clamp(28px,4vw,36px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
            Lista de Deseos
          </h1>
          <p className="mt-2 text-[14px] font-light text-muted-foreground">
            Tu selección personal de fragancias exclusivas.
          </p>
        </div>

        <ListaFavoritos favoritosIniciales={perfumesFavoritos} />
      </main>
    </div>
  );
}
