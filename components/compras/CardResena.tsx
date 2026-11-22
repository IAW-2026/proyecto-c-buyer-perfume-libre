"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Star } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ActionResult } from "@/lib/errors";

interface CardResenaProps {
  titulo: string;
  descripcion: string;
  id: string;
  ordenId: string;
  yaEnviado?: boolean;
  calificacionExistente?: {
    puntuacion: number;
    comentario?: string | null;
  } | null;
  onEnviar: (
    id: string,
    ordenId: string,
    rating: number,
    comentario: string,
  ) => Promise<ActionResult<{ mensaje: string; id: string }>>;
}

export default function CardResena({
  titulo,
  descripcion,
  id,
  ordenId,
  yaEnviado = false,
  calificacionExistente,
  onEnviar,
}: CardResenaProps) {
  const [rating, setRating] = useState(calificacionExistente?.puntuacion || 0);
  const [comentario, setComentario] = useState(
    calificacionExistente?.comentario || "",
  );
  const [estado, setEstado] = useState<
    "idle" | "enviando" | "enviado" | "error"
  >(yaEnviado ? "enviado" : "idle");

  const manejarEnvio = async () => {
    if (rating === 0) {
      toast.warning("Por favor seleccioná una calificación de 1 a 5 estrellas.");
      return;
    }
    setEstado("enviando");
    try {
      const res = await onEnviar(id, ordenId, rating, comentario);
      if (res.success) {
        setEstado("enviado");
        toast.success(res.data.mensaje || "¡Reseña guardada con éxito!");
      } else {
        setEstado("error");
        toast.error(res.error.message || "No se pudo guardar la reseña.");
      }
    } catch {
      setEstado("error");
      toast.error("Ocurrió un error inesperado al enviar la reseña.");
    }
  };

  if (estado === "enviado") {
    return (
      <Card className="rounded-sm border-accent/30 bg-accent/5 shadow-none flex items-center justify-center h-full min-h-55">
        <CardContent className="pt-6 text-center space-y-2">
          <Star className="w-8 h-8 mx-auto mb-2 text-accent fill-accent" />
          <p className="text-[14px] font-semibold text-foreground">
            ¡Gracias por tu opinión!
          </p>
          <div className="flex justify-center text-accent py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-current" : "text-border/40"}`}
              />
            ))}
          </div>
          {comentario && (
            <p className="text-[12px] italic text-muted-foreground line-clamp-2 max-w-xs mx-auto">
              &ldquo;{comentario}&rdquo;
            </p>
          )}
          <p className="text-[11px] text-muted-foreground pt-1">
            Tu reseña ya fue registrada para esta compra.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm border-border/60 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/30">
        <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground">
          {titulo}
        </CardTitle>
        <CardDescription className="text-[13px] font-light text-muted-foreground mt-1">
          {descripcion}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5 flex flex-col grow gap-5">
        {/* ESTRELLAS DORADAS */}
        <div className="flex gap-1.5 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  rating >= star ? "fill-accent text-accent" : "text-border"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Dejá un comentario (opcional)..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="resize-none h-20 text-[13px] bg-secondary/20 border-border/60 focus-visible:ring-accent rounded-sm"
        />

        <div className="flex justify-end mt-auto pt-2">
          <Button
            size="sm"
            onClick={manejarEnvio}
            disabled={estado === "enviando" || rating === 0}
            className="rounded-sm bg-foreground text-background uppercase tracking-[0.08em] text-[10px] font-bold hover:bg-foreground/90 h-10 px-5"
          >
            {estado === "enviando" ? "Enviando..." : "Publicar reseña"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
