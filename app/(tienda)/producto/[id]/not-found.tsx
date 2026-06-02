import Link from "next/link";

export default function NotFoundProducto() {
  return (
    <div className="flex-1 w-full bg-white flex items-center justify-center overflow-hidden">
      <main className="container mx-auto px-4 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Perfume no encontrado
        </h1>
        <p className="text-muted-foreground mb-6">
          El producto que buscás no existe o ya no está disponible.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al catálogo
        </Link>
      </main>
    </div>
  );
}
