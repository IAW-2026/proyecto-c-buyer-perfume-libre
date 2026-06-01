import { Loader2, ShieldCheck, LucideIcon } from "lucide-react";

interface LoadingCheckoutProps {
  mensaje?: string;
  Icono?: LucideIcon;
}

export default function LoadingCheckout({
  mensaje = "Preparando tu compra",
  Icono = ShieldCheck,
}: LoadingCheckoutProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50/50 px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{mensaje}</h2>
        <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5">
          <Icono className="h-4 w-4 text-green-600" />
          Tus datos están protegidos
        </p>
      </div>
    </div>
  );
}
