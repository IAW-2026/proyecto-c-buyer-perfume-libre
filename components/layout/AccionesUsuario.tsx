"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import {
  Heart,
  LayoutDashboard,
  LucideIcon,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useOptimisticAuth } from "./useOptimisticAuth";

interface AccionesUsuarioProps {
  initialSignedIn: boolean;
  initialAdmin: boolean;
}

export default function AccionesUsuario({
  initialSignedIn,
  initialAdmin,
}: AccionesUsuarioProps) {
  const { signedIn, esAdmin } = useOptimisticAuth(
    initialSignedIn,
    initialAdmin,
  );

  return (
    <div className="flex items-center gap-2 md:gap-4 shrink-0">
      {!signedIn && (
        <div className="animate-in fade-in duration-300">
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="text-[11px] uppercase tracking-[0.08em] font-bold rounded-sm h-9 px-4 border-border/60 hover:bg-secondary/20"
            >
              Ingresar
            </Button>
          </SignInButton>
        </div>
      )}

      {signedIn && (
        <div className="hidden md:flex items-center gap-2 animate-in fade-in duration-300">
          {esAdmin === undefined ? (
            <Skeleton className="h-9 w-9 rounded-sm" />
          ) : esAdmin ? (
            <HeaderButton
              href="/admin/dashboard"
              icon={LayoutDashboard}
              label="Admin"
            />
          ) : null}
          <HeaderButton href="/compras" icon={ShoppingBag} label="Compras" />
          <HeaderButton href="/favoritos" icon={Heart} label="Favoritos" />
          <HeaderButton href="/carrito" icon={ShoppingCart} label="Carrito" />
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0 mx-1.5">
            <UserButton />
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
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
