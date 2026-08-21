"use client";
import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

export default function CheckoutPayment() {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Inicializamos Mercado Pago con tu llave pública
    if (!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      console.error(
        "La variable de entorno NEXT_PUBLIC_MP_PUBLIC_KEY no está definida",
      );
      return;
    }

    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "es-AR" });

    // 2. Le pedimos la preferencia a nuestra propia API que hicimos en el paso anterior
    fetch("/api/mercadopago/create-preference", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setPreferenceId(data.preferenceId));
  }, []);

  // Si todavía no hay preferencia, mostramos un loading
  if (!preferenceId) return <p>Cargando pasarela de pago...</p>;

  // 3. Renderizamos el Brick
  return (
    <Payment
      initialization={{
        amount: 100, // Debe coincidir con el unit_price de tu backend
        preferenceId: preferenceId,
      }}
      customization={{
        paymentMethods: {
          ticket: "all",
          creditCard: "all",
          debitCard: "all",
          mercadoPago: "all",
        },
      }}
      onSubmit={async ({ selectedPaymentMethod, formData }) => {
        try {
          const response = await fetch("/api/mercadopago/process-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // formData ya viene armado perfecto por el Brick
            body: JSON.stringify(formData),
          });

          const data = await response.json();
          console.log("Respuesta del pago:", data);

          // Acá manejas qué pasa según el resultado
          if (data.status === "approved") {
            alert("¡Pago aprobado con éxito!");
            // Redirigir a página de éxito
          } else if (data.status === "pending") {
            alert("El pago está pendiente (ideal para Rapipago/Pago Fácil).");
            // Redirigir a página de instrucciones
          } else {
            alert(`El pago fue rechazado. Motivo: ${data.status_detail}`);
          }
        } catch (error) {
          console.error("Error enviando el pago:", error);
          alert("Hubo un error de conexión.");
        }
      }}
      onError={async (error) => {
        console.error("Error en el Brick:", error);
      }}
    />
  );
}
