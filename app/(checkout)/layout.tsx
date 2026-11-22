import HeaderCheckout from "@/components/layout/HeaderCheckout";

export const dynamic = "force-dynamic";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent/30 selection:text-foreground">
      <HeaderCheckout />

      <main id="main-content" className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
