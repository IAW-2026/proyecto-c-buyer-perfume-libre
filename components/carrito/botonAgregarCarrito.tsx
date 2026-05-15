"use client";

import { useEffect } from "react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, useClerk } from "@clerk/nextjs";
import { agregarAlCarrito } from "@/actions/carrito";

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

  useEffect(() => {
    if (isLoaded && userId) {
      const agregarPendiente = localStorage.getItem("intencionAgregarCarrito");

      if (agregarPendiente === perfumeId) {
        localStorage.removeItem("intencionAgregarCarrito");

        agregarAlCarrito(perfumeId).catch((err) => {
          console.error(
            "Error al procesar la intención de agregar al carrito",
            err,
          );
        });
      }
    }
  }, [isLoaded, userId, perfumeId]);

  const handleAgregarAlCarrito = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      localStorage.setItem("intencionAgregarCarrito", perfumeId);
      clerk.redirectToSignIn();
      return;
    }

    try {
      await agregarAlCarrito(perfumeId);
    } catch (error) {
      console.error("Error al agregar al carrito", error);
    }
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleAgregarAlCarrito}
    >
      Agregar al carrito
    </Button>
  );
}
