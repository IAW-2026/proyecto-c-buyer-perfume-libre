import Header from "@/components/layout/header";
import Link from "next/link";

export default function NotFoundProducto() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Perfume no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          El producto que buscás no existe o ya no está disponible.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Volver al catálogo
        </Link>
      </main>
    </div>
  );
}
