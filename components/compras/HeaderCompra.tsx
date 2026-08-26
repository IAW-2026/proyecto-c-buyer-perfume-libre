import { COLOR_ESTADOS, EstadoOrdenType } from "@/schema/perfume.schema";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";
import { Badge } from "../ui/badge";
import { cn, obtenerLabelEstado } from "@/lib/utils";

export default function HeaderCompra({
  fecha,
  estado,
  cantidadProductos,
}: {
  fecha: Date;
  estado: EstadoOrdenType;
  cantidadProductos: number;
}) {
  return (
    <div className="border-b border-border/60 bg-secondary/30 px-4 sm:px-5 py-3 sm:py-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">
            {format(fecha, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <span className="hidden sm:inline text-border/60">|</span>
          <p className="text-[10px] sm:text-[12px] font-light text-muted-foreground mt-0.5 sm:mt-0">
            {cantidadProductos}{" "}
            {cantidadProductos === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div>
          <Badge
            className={cn(
              COLOR_ESTADOS[estado],
              "uppercase tracking-widest font-bold text-[9px] rounded-sm px-2 py-1 sm:px-2.5",
            )}
            variant="secondary"
          >
            {obtenerLabelEstado(estado)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
