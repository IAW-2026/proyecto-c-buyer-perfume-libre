import { Loader2, ShieldCheck, LucideIcon } from "lucide-react";

interface LoadingCheckoutProps {
  mensaje?: string;
  Icono?: LucideIcon;
}

export default function LoadingCheckout({
  mensaje = "Preparando tu compra...",
  Icono = ShieldCheck,
}: LoadingCheckoutProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <Loader2
          className="h-10 w-10 animate-spin text-accent mb-6"
          strokeWidth={1.5}
        />

        <h2 className="font-serif text-[24px] md:text-[28px] font-normal text-foreground tracking-tight mb-3">
          {mensaje}
        </h2>

        <p className="text-[13px] font-light text-muted-foreground flex items-center justify-center gap-2">
          <Icono className="h-4 w-4 text-accent" strokeWidth={1.5} />
          Tus datos están encriptados y protegidos
        </p>
      </div>
    </div>
  );
}
