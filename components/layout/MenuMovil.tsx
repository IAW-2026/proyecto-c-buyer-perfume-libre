"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Heart,
  LayoutDashboard,
  LucideIcon,
  Menu,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

interface MenuMovilProps {
  initialSignedIn: boolean;
  initialAdmin: boolean;
}

export default function MenuMovil({
  initialSignedIn,
  initialAdmin,
}: MenuMovilProps) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const signedIn = isAuthLoaded ? (isSignedIn ?? false) : initialSignedIn;

  const esAdmin = isUserLoaded
    ? user?.publicMetadata?.rol === "ADMIN"
    : initialSignedIn
      ? initialAdmin
      : undefined;

  const prevSignedIn = useRef(signedIn);

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
          {signedIn && (
            <div className="flex flex-col gap-1 animate-in fade-in duration-300">
              <div className="mb-6 px-4 py-3 bg-secondary/10 border border-border/40 rounded-sm">
                <UserButton showName />
              </div>

              {esAdmin === undefined ? (
                <div className="p-3.5">
                  <Skeleton className="h-5 w-32 rounded-sm" />
                </div>
              ) : esAdmin ? (
                <MobileMenuLink
                  href="/admin/dashboard"
                  icon={LayoutDashboard}
                  label="Panel de Control"
                />
              ) : null}
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
            </div>
          )}

          {!signedIn && (
            <div className="animate-in fade-in duration-300">
              <SignInButton mode="modal">
                <Button className="w-full mt-4 h-12 text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90">
                  Ingresar a mi cuenta
                </Button>
              </SignInButton>
            </div>
          )}
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
  icon: LucideIcon;
  label: string;
}) {
  return (
    <SheetClose
      render={
        <Link
          href={href}
          className="flex items-center gap-4 p-3.5 rounded-sm hover:bg-secondary/10 transition-colors text-foreground"
        >
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <span className="font-medium text-[14px]">{label}</span>
        </Link>
      }
      nativeButton={false}
    ></SheetClose>
  );
}
