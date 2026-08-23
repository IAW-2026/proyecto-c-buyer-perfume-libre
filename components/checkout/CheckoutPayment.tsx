"use client";
import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckoutPayment({
  total,
  ordenId,
}: {
  total: number;
  ordenId: string;
}) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isBrickReady, setIsBrickReady] = useState(false);
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

  return (
    <div className="w-full relative min-h-87.5 flex flex-col justify-center">
      {(!preferenceId || !isBrickReady) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card">
          <Loader2 className="w-10 h-10 animate-spin text-foreground mb-4 opacity-80" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Conectando pasarela segura...
          </p>
        </div>
      )}

      <div
        className={`transition-opacity duration-500 w-full ${isBrickReady ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
      >
        {preferenceId && (
          <Payment
            initialization={{
              amount: total,
              preferenceId: preferenceId,
              marketplace: true,
            }}
            customization={{
              visual: {
                style: {
                  theme: "default",
                  customVariables: {
                    baseColor: "#0f172a",
                    buttonTextColor: "#ffffff",
                    formBackgroundColor: "#ffffff",
                    textPrimaryColor: "#0f172a",
                    textSecondaryColor: "#64748b",
                    borderRadiusMedium: "4px",
                    borderRadiusLarge: "4px",
                  },
                },
              },
              paymentMethods: {
                ticket: "all",
                creditCard: "all",
                debitCard: "all",
                mercadoPago: "all",
              },
            }}
            onReady={() => {
              setIsBrickReady(true);
            }}
            onSubmit={async ({ selectedPaymentMethod, formData }) => {
              try {
                const payload = { ...formData, ordenId };
                const response = await fetch(
                  "/api/mercadopago/process-payment",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  },
                );

                const data = await response.json();

                if (data.id) {
                  router.push(
                    `/checkout/resultado?payment_id=${data.id}&ordenId=${ordenId}`,
                  );
                }
              } catch (error) {
                console.error("Error enviando el pago:", error);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
