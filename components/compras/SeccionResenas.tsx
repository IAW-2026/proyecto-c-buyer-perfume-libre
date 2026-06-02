"use client";

import { CardResena } from "./CardResena";
import { enviarResenaProducto, enviarResenaVendedor } from "@/lib/api";

export function SeccionResenas({
  productoId,
  nombreProducto,
  vendedor,
  usuarioId,
}: {
  productoId: string;
  nombreProducto: string;
  vendedor: string;
  usuarioId: string;
}) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Dejá tu opinión</h3>
      <div className="grid grid-rows-1 md:grid-rows-2 gap-6">
        <CardResena
          titulo="Calificá el producto"
          descripcion={`¿Qué te pareció la fragancia de ${nombreProducto}?`}
          colorEstrellas="fill-amber-400 text-amber-400"
          id={productoId}
          usuarioId={usuarioId}
          onEnviar={enviarResenaProducto}
        />

        <CardResena
          titulo="Atención del vendedor"
          descripcion={`¿Cómo fue tu experiencia comprándole a ${vendedor}?`}
          colorEstrellas="fill-blue-500 text-blue-500"
          id={vendedor}
          usuarioId={usuarioId}
          onEnviar={enviarResenaVendedor}
        />
      </div>
    </div>
  );
}
