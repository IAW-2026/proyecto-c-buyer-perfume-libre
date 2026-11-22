"use client";

import { startTransition, useOptimistic } from "react";
import { eliminarFavorito } from "@/actions/favoritos";
import { PerfumeFavorito } from "@/schema/perfume.schema";
import FavoritosVacio from "./FavoritosVacio";
import ProductoCardFavoritos from "./ProductCardFavoritos";
import { toast } from "sonner";

export default function ListaFavoritos({
  favoritosIniciales,
}: {
  favoritosIniciales: PerfumeFavorito[];
}) {
  const [optimisticFavoritos, optimisticallyRemove] = useOptimistic(
    favoritosIniciales,
    (estadoActual, idAEliminar: string) =>
      estadoActual.filter((perfume) => perfume.id !== idAEliminar),
  );

  if (optimisticFavoritos.length === 0) {
    return <FavoritosVacio />;
  }

  const handleEliminar = async (id: string) => {
    startTransition(async () => {
      optimisticallyRemove(id);

      try {
        const res = await eliminarFavorito({ productoId: id });
        if (!res.success) {
          toast.error(res.error.message);
        }
      } catch {
        toast.error("No se pudo eliminar el favorito");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {optimisticFavoritos.map((producto) => (
        <ProductoCardFavoritos
          key={producto.id}
          producto={producto}
          onEliminar={() => handleEliminar(producto.id)}
        />
      ))}
    </div>
  );
}
