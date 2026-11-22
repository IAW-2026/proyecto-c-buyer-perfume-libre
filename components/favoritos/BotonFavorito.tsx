"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorito } from "@/actions/favoritos";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

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
          toggleFavorito({ productoId: perfumeId })
            .then((res) => {
              if (res.success) {
                setEsFav(res.data.enFavoritos);
              } else {
                setEsFav(false);
                toast.error(res.error.message);
              }
            })
            .catch(() => {
              setEsFav(false);
              toast.error("No se pudo actualizar el estado de favoritos");
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
      clerk.openSignIn();
      return;
    }

    const estadoPrevio = esFav;
    setEsFav(!esFav);

    try {
      const res = await toggleFavorito({ productoId: perfumeId });
      if (!res.success) {
        setEsFav(estadoPrevio);
        toast.error(res.error.message);
      } else {
        setEsFav(res.data.enFavoritos);
      }
    } catch {
      setEsFav(estadoPrevio);
      toast.error("No se pudo actualizar el estado de favoritos");
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
