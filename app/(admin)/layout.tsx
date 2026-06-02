import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { obtenerRolUsuario } from "@/actions/usuario";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rolUsuario = await obtenerRolUsuario();

  if (!rolUsuario || rolUsuario.rol !== RolUsuario.ADMIN) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <AdminHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
