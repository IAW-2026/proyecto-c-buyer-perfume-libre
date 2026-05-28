import { CheckCircle2, ShieldCheck } from "lucide-react";
import CardPrimerFormulario from "./CardPrimerFormulario";
import InfoOperacion from "./InfoOperacion";

export default function PrimeraDireccionPantalla() {
  return (
    <section className="mx-auto max-w-6xl px-0 py-6 md:py-10 space-y-6">
      <InfoOperacion
        pasoActual="Paso 1 de 2"
        accion="Crea una dirección de envío"
        informacion="Crea una direccion para seguir con el checkout."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <CardPrimerFormulario />

        <ColumnaAyuda />
      </div>
    </section>
  );
}

function ColumnaAyuda() {
  return (
    <div className="space-y-4 rounded-3xl border border-border/70 bg-muted/30 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold tracking-tight">
            Lo que vas a completar
          </h3>
          <p className="text-sm text-muted-foreground">
            Datos mínimos para dejar la compra lista.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          "Nombre de quien recibe el paquete",
          "Calle, altura y datos opcionales del departamento",
          "Localidad, provincia y código postal",
          "Teléfono para coordinar la entrega",
        ].map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
        La dirección quedará guardada para tus próximas compras y podrás
        editarla más adelante.
      </div>
    </div>
  );
}
