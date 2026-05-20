// components/compras/CardResena.tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// 📝 El "contrato" de props exacto que dedujiste
type Props = {
  titulo: string;
  descripcion: string;
  colorEstrellas: string;
  id: string;
  usuarioId: string;
  onEnviar: (
    id: string,
    usuarioId: string,
    rating: number,
    comentario?: string,
  ) => Promise<void>;
};

export function CardResena({
  titulo,
  descripcion,
  colorEstrellas,
  id,
  usuarioId,
  onEnviar,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado">("idle");

  const manejarEnvio = async () => {
    if (rating === 0) return;
    setEstado("enviando");

    // 🪄 Llamamos a la función que nos pasó el padre
    await onEnviar(id, usuarioId, rating, comentario);

    setEstado("enviado");
  };

  if (estado === "enviado") {
    return (
      <Card className="bg-green-50 border-green-200 shadow-sm">
        <CardContent className="pt-6 text-center text-green-800">
          <p className="font-semibold">¡Gracias por tu calificación!</p>
          <p className="text-sm mt-1">Tu reseña fue publicada con éxito.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b bg-slate-50/50">
        <CardTitle className="text-base">{titulo}</CardTitle>
        <CardDescription className="text-xs">{descripcion}</CardDescription>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col grow gap-4">
        {/* LAS ESTRELLAS */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  rating >= star ? colorEstrellas : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Dejá un comentario (opcional)..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="resize-none h-20 text-sm"
        />

        {/* Usamos mt-auto para empujar el botón siempre hacia abajo, así las cards quedan parejas */}
        <div className="flex justify-end mt-auto pt-2">
          <Button
            size="sm"
            onClick={manejarEnvio}
            disabled={estado === "enviando" || rating === 0}
          >
            {estado === "enviando" ? "Enviando..." : "Publicar reseña"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
