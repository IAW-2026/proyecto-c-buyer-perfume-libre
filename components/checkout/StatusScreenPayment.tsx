"use client";
import { useEffect } from "react";
import { initMercadoPago, StatusScreen } from "@mercadopago/sdk-react";

export default function StatusScreenPayment({
  paymentId,
}: {
  paymentId: string;
}) {
  useEffect(() => {
    // Inicializamos MP de nuevo acá
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
      locale: "es-AR",
    });
  }, []);

  return (
    <StatusScreen
      initialization={{ paymentId: paymentId }}
      onReady={() => {
        // console.log("Status Screen cargado");
      }}
      onError={(error) => {
        // console.error("Error en Status Screen:", error);
      }}
    />
  );
}
