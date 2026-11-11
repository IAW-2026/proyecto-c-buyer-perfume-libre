import { obtenerRolUsuario } from "@/actions/usuario";
import { RolUsuario } from "@/lib/generated/prisma/enums";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Heart,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccionesUsuario() {
  return (
    <div className="flex items-center gap-2 md:gap-4 shrink-0">
      <AccionesAnonimo />
      <div className="hidden md:flex items-center gap-2">
        <AccionesUsuarioLogueado />
      </div>
    </div>
  );
}

async function AccionesUsuarioLogueado() {
  let rolUsuario;
  try {
    rolUsuario = await obtenerRolUsuario();
  } catch (error) {}

  return (
    <Show when="signed-in">
      {rolUsuario?.rol === RolUsuario.ADMIN && (
        <HeaderButton
          href="/admin/dashboard"
          icon={LayoutDashboard}
          label="Admin"
        />
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
