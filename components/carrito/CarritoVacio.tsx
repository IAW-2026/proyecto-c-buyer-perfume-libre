import Link from "next/link";

export default function CarritoVacio() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ir a buscar perfumes
      </Link>
    </div>
  );
}
