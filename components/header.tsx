import { Heart, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="w-full border-b bg-background py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-center relative min-h-12">
          <NombreSitio />
          <AccionesHeader />
        </div>
        <BarraDeBusqueda />
      </div>
    </header>
  );
}

function NombreSitio() {
  return (
    <Link
      href="/"
      aria-label="PerfumeLibre - Ir a inicio"
      className="text-4xl md:text-5xl font-extrabold tracking-tighter"
    >
      Perfume<span className="text-primary">Libre</span>
    </Link>
  );
}

function BarraDeBusqueda() {
  return (
    <div className="flex justify-center w-full">
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar fragancias, marcas, notas..."
          className="w-full pl-10 h-12 text-lg shadow-sm border-2"
        />
      </div>
    </div>
  );
}

function AccionesHeader() {
  return (
    <div className="absolute right-0 flex items-center gap-4">
      <AccionesAnonimo />

      <AccionesUsuario />
    </div>
  );

  function AccionesUsuario() {
    return (
      <Show when="signed-in">
        <HeaderButton href="/compras" icon={ShoppingBag} label="Compras" />
        <HeaderButton href="/favoritos" icon={Heart} label="Favoritos" />
        <HeaderButton href="/carrito" icon={ShoppingCart} label="Carrito" />
        <UserButton />
      </Show>
    );
  }

  function AccionesAnonimo() {
    return (
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="outline">Ingresar</Button>
        </SignInButton>
      </Show>
    );
  }
}

function HeaderButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link href={href}>
      <Button variant="ghost" size="icon" className="relative">
        <Icon className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </Button>
    </Link>
  );
}
