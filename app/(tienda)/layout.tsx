import Header from "@/components/layout/header";

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
