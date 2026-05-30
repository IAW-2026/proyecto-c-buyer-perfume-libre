import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@/lib/generated/prisma/client";
import { obtenerRolUsuario } from "@/actions/usuario";

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
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-tight text-lg">
              Perfume Libre
            </span>
            <span className="text-[10px] bg-red-600/90 text-white px-2 py-0.5 rounded-full font-bold tracking-widest uppercase shadow-sm">
              Admin
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
