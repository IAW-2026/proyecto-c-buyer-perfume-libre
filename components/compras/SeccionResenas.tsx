"use client";

import { enviarResenaProducto, enviarResenaVendedor } from "@/lib/api";
import CardResena from "./CardResena";

export function SeccionResenas({
  productoId,
  nombreProducto,
  vendedor,
  ordenId,
}: {
  productoId: string;
  nombreProducto: string;
  vendedor: string;
  ordenId: string;
}) {
  return (
    <div className="mt-12 pt-8 border-t border-border/60">
      <h3 className="font-serif text-[26px] text-foreground mb-6">
        Dejá tu opinión
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardResena
          titulo="Calificá la fragancia"
          descripcion={`¿Qué te pareció ${nombreProducto}?`}
          id={productoId}
          ordenId={ordenId}
          onEnviar={enviarResenaProducto}
        />

        <CardResena
          titulo="Atención del vendedor"
          descripcion={`¿Cómo fue tu experiencia con ${vendedor}?`}
          id={vendedor}
          ordenId={ordenId}
          onEnviar={enviarResenaVendedor}
        />
      </div>
    </div>
  );
}
