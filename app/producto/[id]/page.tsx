import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Header from "@/components/header";
import { getPerfumeDetalle, PerfumeDetalle } from "@/lib/data";
import CalificacionEstrellas from "@/components/calificacionEstrellas";
import { generarUrl } from "@/lib/utils";
import { redirect } from "next/dist/client/components/navigation";

export default async function ProductoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugCompleto } = await params;
  const idReal = slugCompleto.split("-").pop();

  const producto = await getPerfumeDetalle(idReal?.toString() || "1");

  const slug = generarUrl(producto?.nombre || "", producto?.id || "");

  if (slug != slugCompleto) {
    redirect(`/producto/${slug}`);
  }

  const imagenesGaleria = [
    producto?.imagenUrl,
    ...Array(2).fill(producto?.imagenUrl),
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <ProductImageGallery
            imagenesGaleria={imagenesGaleria}
            producto={producto}
          />
          <ProductInformation producto={producto} />
        </div>
      </main>
    </div>
  );
}

function ProductImageGallery({
  imagenesGaleria,
  producto,
}: {
  imagenesGaleria: any[];
  producto: PerfumeDetalle | null;
}) {
  return (
    <div className="lg:col-span-6 flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100/50 rounded-2xl p-8 min-h-125 border border-slate-200/50">
      <Carousel className="w-full max-w-md">
        <CarouselContent>
          {imagenesGaleria.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square">
                <Image
                  src={img || ""}
                  alt={producto?.nombre || "Perfume"}
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {imagenesGaleria.length > 1 && (
          <>
            <CarouselPrevious className="-left-6 lg:-left-16 bg-white hover:bg-primary hover:text-white shadow-lg" />
            <CarouselNext className="-right-6 lg:-right-16 bg-white hover:bg-primary hover:text-white shadow-lg" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function ProductInformation({ producto }: { producto: PerfumeDetalle | null }) {
  return (
    <div className="lg:col-span-6 flex flex-col gap-6 h-fit">
      {/* 1. Encabezado: Marca */}
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
        <ProductEncabezado
          marca={producto?.marca || "Marca Desconocida"}
          nombre={producto?.nombre || "Producto Desconocido"}
        />

        {/* 2. CALIFICACIÓN */}
        <ProductCalificacion calificacion={producto?.calificacion || 0} />
      </div>

      {/* 3. Precio y Envío */}
      <ProductPrecio
        precio={producto?.precio || 0}
        vendedor={producto?.vendedor || "Tienda oficial"}
      />
      <ProductDetalles
        tamano={producto?.tamaño || "-"}
        genero={producto?.genero || "-"}
      />
      <ProductActions />
      <ProductDescription
        descripcion={
          producto?.descripcion ||
          "No hay descripción disponible para este perfume."
        }
      />
    </div>
  );
}

function ProductEncabezado({
  marca,
  nombre,
}: {
  marca: string;
  nombre: string;
}) {
  return (
    <>
      <span className="text-xs uppercase font-bold tracking-widest text-primary">
        {marca}
      </span>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-snug">
        {nombre}
      </h1>
    </>
  );
}

//TODO: Hacer featch a feedback app para traer la calificación real del producto
function ProductCalificacion({ calificacion }: { calificacion: number }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-sm font-medium text-foreground">
        {calificacion?.toFixed(1)}
      </span>
      <CalificacionEstrellas rating={calificacion || 0} />
      <span className="text-sm text-muted-foreground">(123 opiniones)</span>
    </div>
  );
}

function ProductPrecio({
  precio,
  vendedor,
}: {
  precio: number;
  vendedor: string;
}) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <span className="text-5xl font-bold tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        ${precio?.toLocaleString()}
      </span>

      {/* Vendedor */}
      <p className="text-sm text-muted-foreground">
        Vendido por{" "}
        <span className="text-primary font-semibold cursor-pointer hover:underline">
          {vendedor}
        </span>
      </p>
    </div>
  );
}

function ProductDescription({ descripcion }: { descripcion: string }) {
  return (
    <div className="mt-2 p-5 bg-slate-50 rounded-xl border border-slate-200">
      <h3 className="font-bold text-sm mb-2 text-foreground">Descripción</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-balance">
        {descripcion || "No hay descripción disponible para este perfume."}
      </p>
    </div>
  );
}

function ProductActions() {
  return (
    <div className="flex flex-col gap-3 py-4 border-y border-slate-200">
      <Button
        size="lg"
        className="w-full text-base font-bold h-12 shadow-md hover:shadow-lg transition-all"
      >
        Comprar ahora
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full text-base font-bold h-12 border-2 hover:border-primary hover:bg-primary/5 transition-all"
      >
        Agregar al carrito
      </Button>
    </div>
  );
}

function ProductDetalles({
  tamano,
  genero,
}: {
  tamano: string;
  genero: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Tamaño
          </p>
          <p className="text-lg font-semibold text-foreground">{tamano}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Género
          </p>
          <p className="text-lg font-semibold text-foreground capitalize">
            {genero}
          </p>
        </div>
      </div>
    </div>
  );
}
