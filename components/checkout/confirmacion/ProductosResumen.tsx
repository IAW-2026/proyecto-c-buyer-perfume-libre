import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import { itemsDeOrdenDb, Perfume } from "@/schema/perfume.schema";

export default function ProductosResumen({
  items,
  productosInfo,
}: {
  items: itemsDeOrdenDb;
  productosInfo: Perfume[];
}) {
  return (
    <Card className="rounded-sm border-border/60 shadow-sm overflow-hidden bg-card">
      <CardHeader className="bg-secondary/30 border-b border-border/40 pb-3 sm:pb-4 pt-4 sm:pt-5 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-foreground">
            <ShoppingBag className="w-4 h-4 text-accent" />
            Artículos en la orden
          </CardTitle>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.08em] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-sm border border-border/60">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 sm:gap-5 p-4 sm:p-6 items-center"
            >
              <div className="relative w-16 sm:w-20 shrink-0 aspect-3/4 bg-secondary rounded-sm border border-border/40 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.imagenesUrl[0] || "/placeholder.png"
                  }
                  alt={
                    productosInfo.find((p) => p.id === item.productoId)
                      ?.nombre || "Producto"
                  }
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                  <div className="text-left min-w-0">
                    <h3 className="font-serif text-[15px] sm:text-[18px] font-normal text-foreground leading-tight line-clamp-2 sm:line-clamp-1">
                      {productosInfo.find((p) => p.id === item.productoId)
                        ?.nombre || "Producto desconocido"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-1 sm:mt-1.5">
                      Cantidad:{" "}
                      <span className="font-semibold text-foreground/80">
                        {item.cantidad}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[14px] sm:text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </p>
                    {item.cantidad > 1 && (
                      <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                        {formatearPrecio(item.precio)} c/u
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
