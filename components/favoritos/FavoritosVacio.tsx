import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function FavoritosVacio() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-border/50 bg-card px-6 py-20 text-center shadow-sm">
      <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal text-foreground mb-3">
        Tu lista de deseos está vacía
      </h2>
      <p className="mx-auto max-w-md text-[14px] font-light text-muted-foreground leading-relaxed mb-8">
        Aún no has guardado ninguna fragancia. Explora nuestro catálogo y
        selecciona tus favoritas.
      </p>
      <Link
        href="/?page=1"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "h-12 px-8 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all",
        )}
      >
        Explorar fragancias
      </Link>
    </div>
  );
}
