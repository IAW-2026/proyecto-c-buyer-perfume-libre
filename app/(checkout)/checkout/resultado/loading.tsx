import LoadingCheckout from "@/components/checkout/LoadingCheckout";
import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return <LoadingCheckout mensaje="Validando pago" Icono={ShieldCheck} />;
}
