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
    <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Truck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-[0.2em]">
            {pasoActual}
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {accion}
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          {informacion}
        </p>
      </div>
    </div>
  );
}
