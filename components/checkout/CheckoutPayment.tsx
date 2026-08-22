"use client";
import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";

export default function CheckoutPayment({
  total,
  ordenId,
}: {
  total: number;
  ordenId: string;
}) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
      locale: "es-AR",
    });

    fetch("/api/mercadopago/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total, ordenId }),
    })
      .then((res) => res.json())
      .then((data) => setPreferenceId(data.preferenceId));
  }, [total, ordenId]);

  if (!preferenceId) return <p>Conectando de forma segura...</p>;

  return (
    <Payment
      initialization={{
        amount: total,
        preferenceId: preferenceId,
        marketplace: true,
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
          // Le inyectamos el ordenId al formData para que el backend sepa a qué orden corresponde
          const payload = { ...formData, ordenId };

          const response = await fetch("/api/mercadopago/process-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.id) {
            // Mandamos a tu página de resultados híbrida
            router.push(
              `/checkout/resultado?payment_id=${data.id}&ordenId=${ordenId}`,
            );
          }
        } catch (error) {
          console.error("Error enviando el pago:", error);
        }
      }}
      onError={async (error) => {
        console.error("Error en el Brick:", error);
      }}
    />
  );
}
