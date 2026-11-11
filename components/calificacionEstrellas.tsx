import { Star, StarHalf } from "lucide-react";

//TODO: Cambiar por zod asumimos que max es 5 y min es 0 puede ser decimal
interface EstrellasProps {
  rating: number;
}

export default function CalificacionEstrellas({ rating }: EstrellasProps) {
  const estrellaPiso = Math.floor(rating);
  const hayMediaEstrella = rating % 1 >= 0.5;
  const estrellasVacias = 5 - estrellaPiso - (hayMediaEstrella ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(estrellaPiso)].map((_, i) => (
        <Star key={`full-${i}`} className="h-3 w-3 fill-accent text-accent" />
      ))}

      {/* Media Estrella */}
      {hayMediaEstrella && (
        <StarHalf className="h-3 w-3 fill-accent text-accent" />
      )}

      {/* Estrellas Vacías con color sutil */}
      {[...Array(estrellasVacias)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground/40" />
      ))}
    </div>
  );
}
