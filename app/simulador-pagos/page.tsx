"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export default function SimuladorPagosApp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <p className="text-xl">Cargando simulador...</p>
        </div>
      }
    >
      <SimuladorPagosContenido />
    </Suspense>
  );
}

function SimuladorPagosContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ordenId = searchParams.get("ordenId");

  if (!ordenId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-xl">
          No se encontró la orden. Por favor, volvé al carrito.
        </p>
      </div>
    );
  }

  const simularTransaccion = async (resultado: "aprobado" | "rechazado") => {
    await fetch("/api/webhooks/pago-aprobado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.NEXT_PUBLIC_BUYER_API_KEY as string,
      },
      body: JSON.stringify({
        id_orden: ordenId,
        id_pago: `pago_mock_${Math.floor(Math.random() * 10000)}`,
        estado: resultado,
      }),
    });

    const statusParam = resultado === "aprobado" ? "success" : "failure";
    router.push(`/checkout/resultado?status=${statusParam}&ordenId=${ordenId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
      <h1>Simulador de PAYMENTS APP</h1>
      <p>Orden a pagar: {ordenId}</p>

      <div className="flex gap-4">
        <Button
          onClick={() => simularTransaccion("aprobado")}
          className="bg-green-600 hover:bg-green-700"
        >
          Simular Pago Exitoso
        </Button>
        <Button
          onClick={() => simularTransaccion("rechazado")}
          className="bg-red-600 hover:bg-red-700"
        >
          Simular Pago Rechazado
        </Button>
      </div>
    </div>
  );
}
