import {
  Heart,
  LayoutDashboard,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import SiteBrand from "./SiteBrand";
import { BarraDeBusqueda } from "./BarraDeBusqueda";
import { obtenerRolUsuario } from "@/actions/usuario";
import { RolUsuario } from "@/lib/generated/prisma/browser";

export default function Header() {
  return (
    <header className="w-full border-b bg-background py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-center relative min-h-12">
          <SiteBrand />
          <AccionesHeader />
        </div>
        <BarraDeBusqueda />
      </div>
    </header>
  );
}

function AccionesHeader() {
  return (
    <div className="absolute right-0 flex items-center gap-4">
      <AccionesAnonimo />

      <AccionesUsuario />
    </div>
  );

  async function AccionesUsuario() {
    const rolUsuario = await obtenerRolUsuario();

    return (
      <Show when="signed-in">
        {rolUsuario.rol === RolUsuario.ADMIN && (
          <HeaderButton href="/admin" icon={LayoutDashboard} label="Admin" />
        )}
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
