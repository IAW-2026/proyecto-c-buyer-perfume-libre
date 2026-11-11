import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { obtenerUsuarios } from "@/actions/admin";
import BotonEstadoUsuario from "@/components/admin/usuarios/BotonEstadoUsuario";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const usuarios = await obtenerUsuarios();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[28px] font-normal text-foreground tracking-tight">
          Directorio de Clientes
        </h1>
        <p className="text-[14px] font-light text-muted-foreground mt-1">
          Gestión de accesos y auditoría de identidades registradas en la
          plataforma.
        </p>
      </div>

      <Card className="rounded-sm border-border/60 bg-secondary/30 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground px-6 h-12 w-75">
                  Usuario
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  ID Referencia
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  Fecha de Alta
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground h-12">
                  Estado
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground text-center h-12 px-6">
                  Control de Acceso
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/40 bg-card">
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-[14px] font-light text-muted-foreground"
                  >
                    No hay usuarios registrados en el sistema.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow
                    key={usuario.id}
                    className="hover:bg-secondary/10 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/60 bg-secondary/50 shrink-0">
                          {usuario.imagenUrl ? (
                            <Image
                              src={usuario.imagenUrl}
                              alt={usuario.nombre}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-serif text-muted-foreground">
                              {usuario.nombre.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-medium text-foreground truncate">
                            {usuario.nombre}
                          </span>
                          <span className="text-[12px] text-muted-foreground truncate">
                            {usuario.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* ID AUTH */}
                    <TableCell className="text-[11px] font-mono text-muted-foreground">
                      {usuario.id.slice(0, 12)}...
                    </TableCell>

                    {/* FECHA DE ALTA */}
                    <TableCell className="text-[12px] text-foreground">
                      {format(new Date(usuario.fechaRegistro), "dd MMM, yyyy", {
                        locale: es,
                      })}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`uppercase tracking-widest font-bold text-[9px] rounded-sm px-2 py-0.5 border-none shadow-none ${
                          usuario.estaBaneado
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                        }`}
                        variant="secondary"
                      >
                        {usuario.estaBaneado ? "Suspendido" : "Activo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 text-center">
                      <BotonEstadoUsuario
                        usuarioId={usuario.id}
                        estaBaneado={usuario.estaBaneado === true}
                      />
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
