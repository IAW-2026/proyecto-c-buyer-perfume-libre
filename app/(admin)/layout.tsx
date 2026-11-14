import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.rol !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent/30 selection:text-foreground">
      <AdminHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-300">
        <AdminNav />

        {children}
      </main>
    </div>
  );
}
