import CheckoutPayment from "@/components/checkout/CheckoutPayment";

export default function CheckoutPage() {
  return (
    <main className="max-w-xl mx-auto p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Finalizar Compra</h1>
      <p className="text-gray-600 mb-6">Total a pagar: $100.00</p>

      {/* Acá se renderiza el Brick de Mercado Pago */}
      <div className="bg-white rounded-lg shadow p-4">
        <CheckoutPayment />
      </div>
    </main>
  );
}
