import { obtenerOrdenes } from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COLOR_ESTADOS_STRING } from "@/schema/perfume.schema";
import { formatearPrecio } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import Link from "next/link";
import { FiltrosOrdenes } from "@/components/admin/ordenes/FiltrosOrdenes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Órdenes - Admin",
  description:
    "Revisa el historial completo de transacciones, importes y estados de logística de Perfume Libre.",
};

export default async function AdminOrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;

  const ordenes = await obtenerOrdenes({ q, estado });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-normal text-foreground tracking-tight">
          Registro de Órdenes
        </h1>
        <p className="text-[14px] font-light text-muted-foreground mt-1">
          Historial completo de transacciones, importes y estados de logística
          de Perfume Libre.
        </p>
      </div>

      <FiltrosOrdenes />

      <Card className="rounded-sm border-border/60 bg-secondary/30 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground px-6 h-12">
                  Fecha
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  ID Orden
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  Operador
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  Estado
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground text-right h-12">
                  Total
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground text-center h-12 px-6 w-20">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-card divide-y divide-border/40">
              {ordenes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-[14px] font-light text-muted-foreground"
                  >
                    No se encontraron órdenes.
                  </TableCell>
                </TableRow>
              ) : (
                ordenes.map((orden) => (
                  <TableRow
                    key={orden.id}
                    className="hover:bg-secondary/10 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-foreground">
                      {format(new Date(orden.createdAt), "dd MMM, yyyy", {
                        locale: es,
                      })}
                    </TableCell>

                    <TableCell className="text-[12px] font-mono text-muted-foreground">
                      {orden.id.slice(0, 8)}...
                    </TableCell>

                    <TableCell className="text-[13px] font-light text-foreground">
                      <span className="font-medium">{orden.operadorEnvio}</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {orden.servicioEnvio}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`${COLOR_ESTADOS_STRING[orden.estado]} uppercase tracking-widest font-bold text-[9px] rounded-sm px-2 py-0.5 border-none shadow-none`}
                        variant="secondary"
                      >
                        {orden.estado}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-[15px] font-semibold text-foreground tracking-tight">
                      {formatearPrecio(orden.total)}
                    </TableCell>

                    <TableCell className="px-6 text-center">
                      <Link
                        href={`/admin/ordenes/${orden.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-all"
                        title="Ver detalle del pedido"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
