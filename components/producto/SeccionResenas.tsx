// components/producto/SeccionResenas.tsx
import { Sparkles, Star, Package, User, MessageCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerResumenYResenas } from "@/actions/resumen-ia";

export default async function SeccionResenas({
  productoId,
}: {
  productoId: string;
}) {
  // Consulta de solo lectura rápida (no bloquea con llamadas a LLM)
  const { resumenIA, resenasCrudas: resenas } =
    await obtenerResumenYResenas(productoId);

  // Estado explícito: sin reseñas aún
  if (!resenas || resenas.length === 0) {
    return (
      <div className="mt-16 lg:mt-24 pt-12 lg:pt-16 border-t border-border/40 flex justify-center">
        <section className="w-full max-w-4xl space-y-4 text-center py-8">
          <div className="h-12 w-12 rounded-full bg-secondary/60 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-[22px] md:text-[24px] text-foreground">
            Aún no hay opiniones sobre este perfume
          </h2>
          <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
            Sé el primero en dejar una reseña al recibir tu pedido para ayudar a otros miembros de la comunidad.
          </p>
        </section>
      </div>
    );
  }

  const promedioCalificacion = (
    resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length
  ).toFixed(1);

  return (
    <div className="mt-16 lg:mt-24 pt-12 lg:pt-16 border-t border-border/40 flex justify-center">
      <section className="w-full max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-foreground" />
            <h2 className="font-serif text-[24px] md:text-[28px] text-foreground">
              Opiniones de los compradores
            </h2>
          </div>
          <div className="flex items-center gap-2 text-accent">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(promedioCalificacion))
                      ? "fill-current"
                      : "text-border/40"
                  }`}
                />
              ))}
            </div>
            <span className="text-[14px] font-bold text-foreground">
              {promedioCalificacion}
            </span>
            <span className="text-[12px] text-muted-foreground">
              ({resenas.length} {resenas.length === 1 ? "opinión" : "opiniones"})
            </span>
          </div>
        </div>

        {/* BLOQUE IA: 1) Resumen disponible */}
        {resumenIA ? (
          <Card className="bg-secondary/10 border-accent/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <CardHeader className="pb-3 pt-5 px-5 md:px-6">
              <CardTitle className="text-[12px] uppercase tracking-widest font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Resumen generado por IA
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 md:px-6 pb-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Star className="h-3 w-3" /> Sobre el perfume
                </p>
                <p className="text-[14px] md:text-[15px] text-foreground/90 font-light leading-relaxed">
                  {resumenIA.resumenProducto}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Package className="h-3 w-3" /> Sobre el vendedor
                </p>
                <p className="text-[14px] md:text-[15px] text-foreground/90 font-light leading-relaxed">
                  {resumenIA.resumenVendedor}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* BLOQUE IA: 2) Resumen pendiente de generación */
          <div className="p-4 rounded-sm border border-border/60 bg-secondary/20 flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-[12px] text-muted-foreground">
              El análisis inteligente de IA se encuentra en procesamiento y estará disponible a la brevedad.
            </p>
          </div>
        )}

        {/* BLOQUE CRUDO */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground mb-6">
            Comentarios recientes ({resenas.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resenas.map((resena) => (
              <div
                key={resena.id}
                className="p-5 rounded-sm border border-border/60 bg-card space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < resena.rating ? "fill-current" : "text-border/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground font-light leading-relaxed line-clamp-3">
                  &ldquo;{resena.comentario}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
