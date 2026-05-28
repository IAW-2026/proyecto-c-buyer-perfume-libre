import Link from "next/link";
import { Lock } from "lucide-react";
import HeaderCheckout from "@/components/layout/HeaderCheckout";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderCheckout />

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
