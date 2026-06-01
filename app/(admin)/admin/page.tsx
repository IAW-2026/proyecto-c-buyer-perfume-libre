import { obtenerAdminPageData } from "@/actions/admin";
import { HerramientasDesarrollo } from "@/components/admin/HerramientasDesarollo";
import { VentasChart } from "@/components/admin/VentasChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import { Package, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "Panel de Control - Admin",
  description:
    "Monitoreo global de transacciones, estados de envío e integraciones.",
};

export default async function AdminDashboardPage() {
  const { ganancia, ordenes, usuarios, grafico } = await obtenerAdminPageData();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo global de transacciones, estados de envío e integraciones.
          </p>
        </div>

        <HerramientasDesarrollo />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ResumenCard
          titulo="Ventas Totales"
          icono={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          valor={formatearPrecio(ganancia)}
          descripcion="En toda la plataforma"
        />

        <ResumenCard
          titulo="Órdenes Procesadas"
          icono={<Package className="h-4 w-4 text-muted-foreground" />}
          valor={ordenes.toString()}
          descripcion="Transacciones exitosas"
        />

        <ResumenCard
          titulo="Usuarios Activos"
          icono={<Users className="h-4 w-4 text-muted-foreground" />}
          valor={usuarios.toString()}
          descripcion="Sincronizados con Clerk"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tendencia de Ventas (Últimos 6 meses)</CardTitle>
          <CardDescription>
            Visualización de la ganancia neta mensual de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-75 w-full">
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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        {icono}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{descripcion}</p>
      </CardContent>
    </Card>
  );
}
