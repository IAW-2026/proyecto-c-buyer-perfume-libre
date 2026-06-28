import { obtenerAdminPageData } from "@/actions/admin";
import { HerramientasDesarrollo } from "@/components/admin/dashboard/HerramientasDesarollo";
import { VentasChart } from "@/components/admin/dashboard/VentasChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import { Package, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Panel de Control - Admin",
  description:
    "Monitoreo global de transacciones, estados de envío e integraciones.",
};

export default async function AdminDashboardPage() {
  const datos = await obtenerAdminPageData();

  if (!datos) {
    redirect("/");
  }

  const { ganancia, ordenes, usuarios, grafico } = datos;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(28px,4vw,36px)] font-normal text-foreground leading-[1.1] tracking-tight">
            Panel de Control
          </h1>
          <p className="text-[14px] font-light text-muted-foreground mt-2">
            Monitoreo global de transacciones, estados de envío e integraciones.
          </p>
        </div>

        <HerramientasDesarrollo />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ResumenCard
          titulo="Ventas Totales"
          icono={<TrendingUp className="h-4 w-4 text-accent" />}
          valor={formatearPrecio(ganancia)}
          descripcion="Facturación neta global"
        />

        <ResumenCard
          titulo="Órdenes Procesadas"
          icono={<Package className="h-4 w-4 text-accent" />}
          valor={ordenes.toString()}
          descripcion="Transacciones exitosas"
        />

        <ResumenCard
          titulo="Usuarios Activos"
          icono={<Users className="h-4 w-4 text-accent" />}
          valor={usuarios.toString()}
          descripcion="Sincronizados con Clerk"
        />
      </div>

      <Card className="rounded-sm border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/30 border-b border-border/40 pb-5 pt-6 px-6">
          <CardTitle className="text-[13px] uppercase tracking-[0.08em] font-bold text-foreground">
            Tendencia de Ventas (Últimos 6 meses)
          </CardTitle>
          <CardDescription className="text-[12px] font-light text-muted-foreground mt-1.5">
            Visualización de la ganancia neta mensual de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <VentasChart data={grafico} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResumenCard({
  titulo,
  icono,
  valor,
  descripcion,
}: {
  titulo?: string;
  icono?: React.ReactNode;
  valor?: string;
  descripcion?: string;
}) {
  return (
    <Card className="rounded-sm border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {titulo}
        </CardTitle>
        {icono}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-[32px] font-light tracking-[-0.02em] text-foreground leading-none">
          {valor}
        </div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-3 opacity-80">
          {descripcion}
        </p>
      </CardContent>
    </Card>
  );
}
