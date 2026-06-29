import LoadingCheckout from "@/components/checkout/LoadingCheckout";
import { MapPin } from "lucide-react";

export default function Loading() {
  return <LoadingCheckout mensaje="Cargando tus direcciones" Icono={MapPin} />;
}
