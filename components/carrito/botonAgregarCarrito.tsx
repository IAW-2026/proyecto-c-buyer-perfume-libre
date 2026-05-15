"use client";

import { useEffect, useTransition } from "react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, useClerk } from "@clerk/nextjs";
import { agregarAlCarrito } from "@/actions/carrito";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type BotonAgregarCarritoProps = {
  perfumeId: string;
} & Pick<ComponentProps<typeof Button>, "className" | "variant" | "size">;

export function BotonAgregarCarrito({
  perfumeId,
  className,
  variant,
  size,
}: BotonAgregarCarritoProps) {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isLoaded && userId) {
      const agregarPendiente = localStorage.getItem("intencionAgregarCarrito");

      if (agregarPendiente === perfumeId) {
        localStorage.removeItem("intencionAgregarCarrito");

        agregarAlCarrito(perfumeId)
          .then(() => toast.success("¡Agregado al carrito!"))
          .catch((err) => {
            console.error("Error al procesar la intención", err);
            toast.error("Hubo un problema al guardar tu producto.");
          });
      }
    }
  }, [isLoaded, userId, perfumeId]);

  const handleAgregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      localStorage.setItem("intencionAgregarCarrito", perfumeId);
      clerk.redirectToSignIn();
      return;
    }

    startTransition(async () => {
      try {
        await agregarAlCarrito(perfumeId);
        toast.success("¡Agregado al carrito!");
      } catch (error) {
        console.error(error);
        toast.error("No se pudo agregar al carrito", {
          description: "Por favor, intentá nuevamente en unos minutos.",
        });
      }
    });
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleAgregarAlCarrito}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" />
      )}
      {isPending ? "Agregando..." : "Agregar al carrito"}
    </Button>
  );
}
