import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DireccionDb } from "@/schema/direccion.schema";

export default function DetallesEnvio({
  operadorEnvio,
  servicioEnvio,
  direccion,
}: {
  operadorEnvio: string;
  servicioEnvio: string;
  direccion: DireccionDb;
}) {
  return (
    <Card className="rounded-sm border-border/60 shadow-sm overflow-hidden bg-card">
      <CardHeader className="bg-secondary/30 border-b border-border/40 pb-3 sm:pb-4 pt-4 sm:pt-5 px-4 sm:px-6">
        <CardTitle className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-foreground">
          <Truck className="w-4 h-4 text-accent" />
          Datos de entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-5 sm:gap-6">
          <div className="space-y-1 text-left">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1.5 sm:mb-2.5">
              Método de envío
            </p>
            <p className="font-serif text-[16px] sm:text-[18px] font-normal text-foreground leading-none">
              {operadorEnvio}
            </p>
            <p className="text-[12px] sm:text-[13px] font-light text-muted-foreground mt-1.5">
              Servicio {servicioEnvio}
            </p>
          </div>

          <div className="space-y-1 text-left md:text-right">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1.5 sm:mb-2.5 md:text-right">
              Domicilio de destino
            </p>
            <p className="font-serif text-[16px] sm:text-[18px] font-normal text-foreground leading-none">
              {direccion.calle} {direccion.altura}
            </p>
            <p className="text-[12px] sm:text-[13px] font-light text-muted-foreground mt-1.5">
              {direccion.localidad}, {direccion.provincia}{" "}
              <span className="mx-1 text-border/60">·</span> CP{" "}
              {direccion.codigoPostal}
            </p>
            <p className="text-[11px] sm:text-[12px] font-medium text-foreground/80 pt-1.5 sm:pt-2 uppercase tracking-wide">
              Destinatario: {direccion.nombreDestinatario}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
