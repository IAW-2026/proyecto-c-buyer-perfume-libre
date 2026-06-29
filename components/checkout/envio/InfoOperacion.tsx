import { Truck } from "lucide-react";

export default function InfoOperacion({
  pasoActual,
  accion,
  informacion,
}: {
  pasoActual: string;
  accion: string;
  informacion: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border/60 bg-card p-5 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Truck className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
            {pasoActual}
          </span>
        </div>
        <h2 className="font-serif text-[22px] font-normal text-foreground tracking-tight">
          {accion}
        </h2>
        <p className="text-[13px] font-light text-muted-foreground leading-relaxed">
          {informacion}
        </p>
      </div>
    </div>
  );
}
