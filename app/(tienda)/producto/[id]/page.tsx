import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import CalificacionEstrellas from "@/components/calificacionEstrellas";
import { formatearPrecio, generarUrl } from "@/lib/utils";
import { notFound, redirect } from "next/dist/client/components/navigation";
import {
  obtenerDetallePerfume,
  obtenerResenaProducto,
  obtenerResenaVendedor,
} from "@/lib/api";
import { Perfume } from "@/schema/perfume.schema";
import { productoEstaEnFavoritos } from "@/actions/favoritos";
import { BotonFavorito } from "@/components/favoritos/BotonFavorito";
import { auth } from "@clerk/nextjs/server";
import { BotonAgregarCarrito } from "@/components/carrito/botonAgregarCarrito";
import { Star } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProductoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugCompleto } = await params;
  const idReal = extraerIdDeSlug(slugCompleto);

  if (!idReal) {
    return notFound();
  }

  let producto: Perfume;
  try {
    producto = await obtenerDetallePerfume(idReal);
  } catch (error) {
    return notFound();
  }

  const slug = generarUrl(producto.nombre, producto.id);

  if (slug != slugCompleto) {
    redirect(`/producto/${slug}`);
  }

  const { userId } = await auth();

  let estaEnFavoritos = false;

  if (userId && idReal) {
    estaEnFavoritos = await productoEstaEnFavoritos(idReal);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <ProductImageGallery
            id={producto.id}
            imagenesGaleria={producto.imagenesUrl}
            nombre={producto.nombre}
            estaEnFavoritos={estaEnFavoritos}
          />
          <ProductInformation producto={producto} />
        </div>
      </main>
    </div>
  );
}

function ProductImageGallery({
  id,
  imagenesGaleria,
  nombre,
  estaEnFavoritos,
}: {
  id: string;
  imagenesGaleria: string[];
  nombre: string;
  estaEnFavoritos: boolean;
}) {
  return (
    <div className="lg:col-span-6 relative bg-slate-50 rounded-2xl border border-slate-200/50 overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="absolute top-4 right-4 z-20">
        <BotonFavorito perfumeId={id} esFavoritoInicial={estaEnFavoritos} />
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {imagenesGaleria.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square lg:aspect-4/5 lg:max-h-[75vh] w-full">
                <Image
                  src={img}
                  alt={nombre}
                  fill
                  // Si las fotos vienen sin fondo cambiar a "object-contain"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {imagenesGaleria.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white border-none shadow-md" />
            <CarouselNext className="right-4 bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white border-none shadow-md" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function ProductInformation({ producto }: { producto: Perfume }) {
  return (
    <div className="lg:col-span-6 flex flex-col gap-4 lg:gap-5 h-fit">
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
        <ProductEncabezado marca={producto.marca} nombre={producto.nombre} />

        <Suspense fallback={<Skeleton className="h-5 w-44 mt-3" />}>
          <ProductCalificacion idProducto={producto.id} />
        </Suspense>
      </div>

      <ProductPrecio precio={producto.precio} />

      <Suspense
        fallback={
          <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 py-2">
            <Skeleton className="h-4 w-36 sm:w-48" />
          </div>
        }
      >
        <InfoVendedor vendedor={producto.vendedor} />
      </Suspense>

      <ProductDetalles
        tamano={`${producto.tamaño} ml`}
        genero={producto.genero}
      />
      <ProductActions perfumeId={producto.id} />
      <ProductDescription
        descripcion={
          producto.descripcion ||
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

async function ProductCalificacion({ idProducto }: { idProducto: string }) {
  try {
    const { total, promedio } = await obtenerResenaProducto(idProducto);

    if (!promedio || total === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-3 mt-3">
        <span className="text-sm font-medium text-foreground">
          {promedio.toFixed(1)}
        </span>
        <CalificacionEstrellas rating={promedio} />
        <span className="text-sm text-muted-foreground">
          ({total} opiniones)
        </span>
      </div>
    );
  } catch (error) {
    return null;
  }
}

function ProductPrecio({ precio }: { precio: number }) {
  return (
    <div className="flex flex-col gap-2 py-3">
      <span className="text-5xl font-bold tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        {formatearPrecio(precio)}
      </span>
    </div>
  );
}

async function InfoVendedor({ vendedor }: { vendedor: string }) {
  try {
    const { total, promedio } = await obtenerResenaVendedor(vendedor);

    return (
      <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 py-2">
        <p className="text-sm text-muted-foreground">
          Vendido por{" "}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            {vendedor}
          </span>
        </p>
        {total > 0 ? (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-foreground">
              {promedio.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">({total})</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Vendedor nuevo (Sin calificaciones)
          </span>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-row gap-1 py-2">
        <p className="text-sm text-muted-foreground">
          Vendido por{" "}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            {vendedor}
          </span>
        </p>
      </div>
    );
  }
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

// TODO: Agregar acciones
function ProductActions({ perfumeId }: { perfumeId: string }) {
  return (
    <div className="flex flex-col gap-3 py-3 border-y border-slate-200">
      <Button
        size="lg"
        className="w-full text-base font-bold h-12 shadow-md hover:shadow-lg transition-all"
      >
        Comprar ahora
      </Button>
      <BotonAgregarCarrito
        perfumeId={perfumeId}
        variant="outline"
        size="lg"
        className="w-full text-base font-bold h-12 border-2 hover:border-primary hover:bg-primary/5 transition-all"
      />
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

function extraerIdDeSlug(slug: string): string | undefined {
  return slug.split("-").pop();
}
