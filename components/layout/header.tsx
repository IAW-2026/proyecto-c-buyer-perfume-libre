import {
  Heart,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  SignInButton,
  Show,
  UserButton,
  ClerkLoading,
  ClerkLoaded,
} from "@clerk/nextjs";
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
import { Skeleton } from "../ui/skeleton";

export default function Header() {
  return (
    <header className="w-full border-b border-border/60 bg-card py-4 sticky top-0 z-50 shadow-[0_1px_4px_rgba(28,21,16,0.03)]">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between relative min-h-12 w-full">
          <div className="absolute left-0 md:hidden flex items-center">
            <MenuMovil />
          </div>

          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="md:w-auto w-full flex justify-center md:justify-start">
              <SiteBrand />
            </div>

            <div className="hidden md:block flex-1 min-w-0">
              <Suspense fallback={<BarraDeBusquedaSkeleton />}>
                <BarraDeBusqueda />
              </Suspense>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <AccionesAnonimo />
            <div className="hidden md:flex items-center gap-2">
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
      <div className="relative w-7 h-7 flex items-center justify-center shrink-0 mx-1.5">
        <ClerkLoading>
          <Skeleton className="absolute inset-0 rounded-full bg-secondary/80 border border-border/10 animate-pulse" />
        </ClerkLoading>

        <ClerkLoaded>
          <UserButton />
        </ClerkLoaded>
      </div>
    </Show>
  );
}

function AccionesAnonimo() {
  return (
    <Show when="signed-out">
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm h-9 px-4 border-border/60 hover:bg-secondary/20"
        >
          Ingresar
        </Button>
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
        "relative text-foreground hover:text-accent hover:bg-secondary/10 transition-colors",
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
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
          "h-10 w-10 text-foreground hover:bg-secondary/10",
        )}
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-sm flex flex-col gap-8 pt-12 border-r-border/60 bg-card"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-[24px] font-normal text-foreground">
            Mi Cuenta
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1">
          <Show when="signed-in">
            <div className="mb-6 px-4 py-3 bg-secondary/10 border border-border/40 rounded-sm">
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
            <MobileMenuLink
              href="/favoritos"
              icon={Heart}
              label="Lista de Deseos"
            />
            <MobileMenuLink
              href="/carrito"
              icon={ShoppingCart}
              label="Bolsa de Compras"
            />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="w-full mt-4 h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90">
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
      className="flex items-center gap-4 p-3.5 rounded-sm hover:bg-secondary/10 transition-colors text-foreground"
    >
      <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      <span className="font-medium text-[14px]">{label}</span>
    </Link>
  );
}
