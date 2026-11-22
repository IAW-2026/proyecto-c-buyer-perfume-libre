"use client";

import { crearResenaProducto, crearResenaVendedor } from "@/actions/resenas";
import CardResena from "./CardResena";

export interface SeccionResenasProps {
  productoId: string;
  nombreProducto: string;
  vendedor: string;
  vendedorId: string;
  ordenId: string;
  yaResenadoProducto?: boolean;
  yaResenadoVendedor?: boolean;
  calificacionProducto?: {
    puntuacion: number;
    comentario?: string | null;
  } | null;
  calificacionVendedor?: {
    puntuacion: number;
    comentario?: string | null;
  } | null;
}

export function SeccionResenas({
  productoId,
  nombreProducto,
  vendedor,
  vendedorId,
  ordenId,
  yaResenadoProducto = false,
  yaResenadoVendedor = false,
  calificacionProducto,
  calificacionVendedor,
}: SeccionResenasProps) {
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
          yaEnviado={yaResenadoProducto}
          calificacionExistente={calificacionProducto}
          onEnviar={async (prodId, ordId, rating, comentario) => {
            return await crearResenaProducto({
              productoId: prodId,
              ordenId: ordId,
              rating,
              comentario,
            });
          }}
        />

        <CardResena
          titulo="Atención del vendedor"
          descripcion={`¿Cómo fue tu experiencia con ${vendedor}?`}
          id={vendedorId}
          ordenId={ordenId}
          yaEnviado={yaResenadoVendedor}
          calificacionExistente={calificacionVendedor}
          onEnviar={async (vendId, ordId, rating, comentario) => {
            return await crearResenaVendedor({
              vendedorId: vendId,
              ordenId: ordId,
              rating,
              comentario,
            });
          }}
        />
      </div>
    </div>
  );
}
