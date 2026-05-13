"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorito } from "@/actions/favoritos";
import { useAuth, useClerk } from "@clerk/nextjs";

export function BotonFavorito({
  perfumeId,
  esFavoritoInicial = false,
}: {
  perfumeId: string;
  esFavoritoInicial?: boolean;
}) {
  const [esFav, setEsFav] = useState(esFavoritoInicial);

  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (isLoaded && userId) {
      const favPendiente = localStorage.getItem("intencionFavorito");

      if (favPendiente === perfumeId) {
        localStorage.removeItem("intencionFavorito");

        if (!esFav) {
          setEsFav(true);
          toggleFavorito(perfumeId).catch((err) => {
            console.error("Error al procesar la intención guardada", err);
            setEsFav(false);
          });
        }
      }
    }
  }, [isLoaded, userId, perfumeId, esFav]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      localStorage.setItem("intencionFavorito", perfumeId);
      clerk.redirectToSignIn();
      return;
    }

    setEsFav(!esFav);
    try {
      await toggleFavorito(perfumeId);
    } catch (error) {
      console.error("Error al guardar favorito", error);
      setEsFav(esFav);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full shadow-sm hover:scale-110 transition-transform bg-white/80 backdrop-blur-sm"
      onClick={handleToggle}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${esFav ? "fill-red-500 text-red-500" : "text-slate-400"}`}
      />
    </Button>
  );
}
