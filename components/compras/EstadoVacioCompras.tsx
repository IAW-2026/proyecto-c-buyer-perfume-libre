import { Link } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function EstadoVacioCompras() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-sm border border-border/60 bg-card px-6 py-16 md:py-24 text-center shadow-sm">
      <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal text-foreground mb-3 tracking-tight">
        Aún no tienes compras
      </h2>
      <p className="mx-auto max-w-md text-[14px] font-light text-muted-foreground leading-relaxed">
        Cuando realices tu primera adquisición, aquí podrás hacer el seguimiento
        y ver el detalle de cada pedido.
      </p>
      <div className="mt-8">
        <Link
          href="/?page=1"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-12 px-8 text-[11px] uppercase tracking-widest font-bold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md",
          )}
        >
          Explorar fragancias
        </Link>
      </div>
    </div>
  );
}
