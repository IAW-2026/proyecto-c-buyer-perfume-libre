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

export default function CardResena({
  titulo,
  descripcion,
  id,
  usuarioId,
  onEnviar,
}: {
  titulo: string;
  descripcion: string;
  id: string;
  usuarioId: string;
  onEnviar: (
    id: string,
    userId: string,
    rating: number,
    comentario: string,
  ) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado">("idle");

  const manejarEnvio = async () => {
    if (rating === 0) return;
    setEstado("enviando");
    await onEnviar(id, usuarioId, rating, comentario);
    setEstado("enviado");
  };

  // ESTADO DE ÉXITO PREMIUM
  if (estado === "enviado") {
    return (
      <Card className="rounded-sm border-accent/30 bg-accent/5 shadow-none flex items-center justify-center h-full min-h-55">
        <CardContent className="pt-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-3 text-accent fill-accent" />
          <p className="text-[14px] font-semibold text-foreground">
            ¡Gracias por tu reseña!
          </p>
          <p className="text-[12px] mt-1.5 text-muted-foreground">
            Tu opinión fue publicada con éxito.
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
