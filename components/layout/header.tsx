import {
  Heart,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import SiteBrand from "./SiteBrand";
import { BarraDeBusqueda } from "./BarraDeBusqueda";
import { BarraDeBusquedaSkeleton } from "@/components/layout/BarraDeBusquedaSkeleton";
import { obtenerRolUsuario } from "@/actions/usuario";
import { RolUsuario } from "@/lib/generated/prisma/browser";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

export default function Header() {
  return (
    <header className="w-full border-b bg-background py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between relative min-h-12 w-full">
          <div className="absolute left-0 md:hidden flex items-center">
            <MenuMovil />
          </div>

          <div className="flex items-center gap-4 flex-1 min-w-0">
            <SiteBrand />

            <div className="hidden sm:flex sm:flex-1 min-w-0">
              <Suspense fallback={<BarraDeBusquedaSkeleton />}>
                <BarraDeBusqueda />
              </Suspense>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AccionesAnonimo />
            <div className="hidden md:flex items-center gap-4">
              <AccionesUsuario />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

async function AccionesUsuario() {
  let rolUsuario;
  try {
    rolUsuario = await obtenerRolUsuario();
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
  }

  return (
    <Show when="signed-in">
      {rolUsuario?.rol === RolUsuario.ADMIN && (
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
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative",
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

async function MenuMovil() {
  let rolUsuario;
  try {
    rolUsuario = await obtenerRolUsuario();
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
  }

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-10 w-10",
        )}
      >
        <Menu className="h-7 w-7" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>

      <SheetContent side="left" className="w-75 flex flex-col gap-6 pt-12">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold">Mi Cuenta</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2">
          <Show when="signed-in">
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg">
              <UserButton showName />
            </div>

            {rolUsuario?.rol === RolUsuario.ADMIN && (
              <MobileMenuLink
                href="/admin"
                icon={LayoutDashboard}
                label="Panel de Control"
              />
            )}
            <MobileMenuLink
              href="/compras"
              icon={ShoppingBag}
              label="Mis Compras"
            />
            <MobileMenuLink href="/favoritos" icon={Heart} label="Favoritos" />
            <MobileMenuLink
              href="/carrito"
              icon={ShoppingCart}
              label="Carrito de Compras"
            />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="w-full mt-4" size="lg">
                Ingresar a mi cuenta
              </Button>
            </SignInButton>
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileMenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
