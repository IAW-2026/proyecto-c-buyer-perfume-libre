import { CheckCircle2, ShieldCheck } from "lucide-react";
import CardPrimerFormulario from "./CardPrimerFormulario";
import InfoOperacion from "./InfoOperacion";

export default function PrimeraDireccionPantalla() {
  return (
    <section className="mx-auto max-w-6xl px-0 py-4 md:py-6 space-y-6">
      <InfoOperacion
        pasoActual="Paso 1 de 2"
        accion="Dirección de envío"
        informacion="Por favor, proporciona una dirección para poder calcular las opciones de entrega."
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <CardPrimerFormulario />
        <ColumnaAyuda />
      </div>
    </section>
  );
}

function ColumnaAyuda() {
  return (
    <div className="space-y-5 rounded-sm border border-border/60 bg-secondary/20 p-6 shadow-none">
      <div className="flex items-center gap-3">
        <div className="rounded-sm bg-foreground/5 p-2.5 text-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-[13px] uppercase tracking-wider font-bold text-foreground">
            Datos requeridos
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Información mínima para asegurar tu entrega.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          "Nombre de quien recibe el paquete",
          "Calle, altura y datos del departamento",
          "Localidad, provincia y código postal",
          "Teléfono de contacto para la mensajería",
        ].map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-sm border border-border/40 bg-card px-4 py-3 shadow-2xs"
          >
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
            <p className="text-[13px] font-light text-muted-foreground leading-relaxed">
              {item}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-dashed border-accent/30 bg-accent/5 p-4 text-[12px] leading-relaxed text-muted-foreground">
        Esta dirección quedará registrada de forma segura en tu cuenta privada
        para agilizar tus próximas adquisiciones.
      </div>
    </div>
  );
}
