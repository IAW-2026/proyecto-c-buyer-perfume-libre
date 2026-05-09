import { Star, StarHalf } from "lucide-react";

// Cambiar por zod asumimos que max es 5 y min es 0 puede ser decimal
interface EstrellasProps {
  rating: number;
}

export default function CalificacionEstrellas({ rating }: EstrellasProps) {
  const estrellaPiso = Math.floor(rating);
  const hayMediaEstrella = rating % 1 >= 0.5;
  const estrellasVacias = 5 - estrellaPiso - (hayMediaEstrella ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Estrellas Llenas */}
      {[...Array(estrellaPiso)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}

      {/* Media Estrella */}
      {hayMediaEstrella && (
        <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )}

      {/* Estrellas Vacías */}
      {[...Array(estrellasVacias)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}
