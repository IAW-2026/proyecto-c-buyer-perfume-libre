import LoadingCheckout from "@/components/checkout/LoadingCheckout";
import { Truck } from "lucide-react";

export default function Loading() {
  return <LoadingCheckout mensaje="Buscando opciones de envio" Icono={Truck} />;
}
