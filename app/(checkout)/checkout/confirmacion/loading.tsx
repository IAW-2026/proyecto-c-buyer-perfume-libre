import LoadingCheckout from "@/components/checkout/LoadingCheckout";
import { Receipt } from "lucide-react";

export default function Loading() {
  return (
    <LoadingCheckout
      mensaje="Preparando el resumen de tu compra"
      Icono={Receipt}
    />
  );
}
