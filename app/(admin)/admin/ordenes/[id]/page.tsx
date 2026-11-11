import { obtenerDatosUsuario, obtenerOrdenPorId } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { obtenerDetallesProductos } from "@/lib/api";
import { formatearPrecio } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Package,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Detalle de Orden - Admin",
  description: "Revisa y gestiona los detalles de la orden seleccionada.",
};

// TODO: Revisar calidad

export default async function AdminDetalleOrdenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orden, direccion } = await obtenerOrdenPorId(id);

  if (!orden) {
    redirect("/admin/ordenes");
  }

  const usuario = await obtenerDatosUsuario(orden.usuarioId);

  const detallesPerfumes = await obtenerDetallesProductos(
    orden.items.map((item: any) => item.productoId),
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* BOTÓN VOLVER */}
      <div className="flex items-center justify-between shrink-0">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al registro
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/40 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Centro de Control de Ventas
          </span>
          <h1 className="text-[28px] md:text-[34px] font-normal text-foreground tracking-tight mt-1">
            Orden #{orden.id.toUpperCase()}
          </h1>
          <p className="text-[13px] font-light text-muted-foreground mt-1">
            Registrada el{" "}
            {format(
              new Date(orden.createdAt),
              "dd 'de' MMMM, yyyy 'a las' HH:mm",
              { locale: es },
            )}{" "}
            hs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClienteCard
              nombreCompleto={
                usuario.nombreCompleto
                  ? usuario.nombreCompleto
                  : "Nombre no proporcionado"
              }
              usuarioId={orden.usuarioId}
              email={usuario.email}
            />

            <DestinoCard />
          </div>

          <Card className="rounded-sm border-border/60 bg-card shadow-sm overflow-hidden">
            <CardHeader className="py-4 px-5 bg-secondary/10 border-b border-border/40">
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
                <Package className="h-3.5 w-3.5 text-accent" /> Artículos y
                Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/40">
              {orden.items.map((item) => (
                <div key={item.id} className="flex gap-5 p-5 items-center">
                  <div className="relative w-14 shrink-0 aspect-3/4 bg-secondary rounded-sm border border-border/40 overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        detallesPerfumes.find(
                          (perfume) => perfume.id === item.productoId,
                        )?.imagen || "/placeholder-image.png"
                      }
                      alt={
                        detallesPerfumes.find(
                          (perfume) => perfume.id === item.productoId,
                        )?.nombre || "Producto del catalogo"
                      }
                      className="h-full w-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
                    <div>
                      <h4 className="font-serif text-[17px] font-normal text-foreground leading-tight">
                        {detallesPerfumes.find(
                          (perfume) => perfume.id === item.productoId,
                        )?.nombre || "Producto de Catálogo"}
                      </h4>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
                        Vendedor:{" "}
                        <span className="font-semibold text-accent underline underline-offset-2">
                          {detallesPerfumes.find(
                            (perfume) => perfume.id === item.productoId,
                          )?.vendedor || "No proporcionado"}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Cantidad:{" "}
                        <span className="font-medium text-foreground">
                          {item.cantidad}
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[15px] font-semibold text-foreground tracking-tight">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </p>
                      {item.cantidad > 1 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatearPrecio(item.precio)} c/u
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PagoCard
            total={orden.total}
            costoEnvio={orden.costoEnvio}
            operadorEnvio={orden.operadorEnvio}
            pagoId={orden.pagoId ? orden.pagoId : "No registrado"}
            envioId={orden.envioId ? orden.envioId : "No registrado"}
          />
        </div>
      </div>
    </div>
  );

  function ClienteCard({
    nombreCompleto,
    usuarioId,
    email,
  }: {
    nombreCompleto: string;
    usuarioId: string;
    email: string;
  }) {
    return (
      <Card className="rounded-sm border-border/60 bg-card shadow-sm">
        <CardHeader className="py-4 px-5 bg-secondary/10 border-b border-border/40">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
            <User className="h-3.5 w-3.5 text-accent" /> Comprador
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-[13px] font-light text-muted-foreground space-y-1.5 text-left">
          <p className="font-serif text-[18px] text-foreground font-normal">
            {nombreCompleto}
          </p>
          <p className="text-foreground/90 font-medium">{email}</p>
          <p className="text-[11px] pt-1">
            ID Auth:{" "}
            <span className="font-mono text-muted-foreground">{usuarioId}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  function DestinoCard() {
    return (
      <Card className="rounded-sm border-border/60 bg-card shadow-sm">
        <CardHeader className="py-4 px-5 bg-secondary/10 border-b border-border/40">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
            <Truck className="h-3.5 w-3.5 text-accent" /> Logística de Destino
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-[13px] font-light text-muted-foreground space-y-1.5 text-left">
          <p className="font-serif text-[18px] text-foreground font-normal">
            Provincia: {direccion?.provincia}
          </p>
          <p className="font-serif text-[18px] text-foreground font-normal">
            Localidad: {direccion?.localidad}
          </p>
          <p className="text-foreground/90 font-medium">
            Código Postal:{" "}
            <span className="font-medium text-foreground">
              {direccion?.codigoPostal}
            </span>
          </p>
          <p className="text-[11px] pt-1">Tel: {direccion?.telefono}</p>
        </CardContent>
      </Card>
    );
  }

  function PagoCard({
    total,
    costoEnvio,
    operadorEnvio,
    pagoId,
    envioId,
  }: {
    total: number;
    costoEnvio: number;
    operadorEnvio: string;
    pagoId: string;
    envioId: string;
  }) {
    return (
      <Card className="rounded-sm border-border/60 bg-card shadow-sm sticky top-24 overflow-hidden">
        <CardHeader className="py-4 px-5 bg-secondary/10 border-b border-border/40">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
            <CreditCard className="h-3.5 w-3.5 text-accent" /> Auditoría
            Financiera
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3 text-[13px] font-light text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal productos</span>
              <span className="font-medium text-foreground">
                {formatearPrecio(total - costoEnvio)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Envío ({operadorEnvio})</span>
              <span className="font-medium text-foreground">
                {formatearPrecio(costoEnvio)}
              </span>
            </div>
          </div>

          <Separator className="border-border/60" />

          <div className="flex justify-between items-baseline py-1">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-foreground">
              Total Cobrado
            </span>
            <span className="text-[26px] font-semibold tracking-[-0.02em] text-foreground">
              {formatearPrecio(total)}
            </span>
          </div>

          <Separator className="border-border/60" />

          <div className="bg-secondary/10 p-4 rounded-sm border border-border/40 space-y-2.5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-foreground flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-accent" /> Trazabilidad de APIs
            </p>
            <div className="text-[11px] space-y-1 text-muted-foreground font-light">
              <p>
                • <span className="font-medium">Referencia de pago:</span>{" "}
                {pagoId}
              </p>
              <p>
                • <span className="font-medium">ID envio:</span> {envioId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}
