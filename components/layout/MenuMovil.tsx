import { obtenerRolUsuario } from "@/actions/usuario";
import {
  Heart,
  LayoutDashboard,
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
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { RolUsuario } from "@/lib/generated/prisma/enums";
import Link from "next/link";

export default async function MenuMovil() {
  let rolUsuario;
  try {
    rolUsuario = await obtenerRolUsuario();
  } catch (error) {}

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
                href="/admin/dashboard"
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
