import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";
import Image from "next/image";
import CalificacionEstrellas from "@/components/calificacionEstrellas";
import { cn, formatearPrecio, generarUrl } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
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
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slugCompleto } = await params;
  const idReal = extraerIdDeSlug(slugCompleto);

  if (!idReal) {
    return {
      title: "Producto no encontrado",
    };
  }

  try {
    const producto = await obtenerDetallePerfume(idReal);

    return {
      title: `${producto.nombre} - Perfume Libre`,
      description: `Información detallada del perfume ${producto.nombre}`,
    };
  } catch {
    return {
      title: "Producto no encontrado",
    };
  }
}

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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <nav className="mb-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{producto.marca}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
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
    <div className="lg:col-span-6 relative bg-secondary rounded-sm overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="absolute top-4 right-4 z-20">
        <BotonFavorito perfumeId={id} esFavoritoInicial={estaEnFavoritos} />
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {imagenesGaleria.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-3/4 w-full">
                <Image
                  src={img}
                  alt={nombre}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {imagenesGaleria.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-background/90 hover:bg-background hover:text-accent border-none shadow-sm transition-all" />
            <CarouselNext className="right-4 bg-background/90 hover:bg-background hover:text-accent border-none shadow-sm transition-all" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function ProductInformation({ producto }: { producto: Perfume }) {
  return (
    <div className="lg:col-span-6 flex flex-col pt-4 h-fit">
      <ProductEncabezado marca={producto.marca} nombre={producto.nombre} />

      <Suspense fallback={<Skeleton className="h-5 w-44 mt-3" />}>
        <ProductCalificacion idProducto={producto.id} />
      </Suspense>

      <ProductPrecio precio={producto.precio} />

      <Suspense fallback={<Skeleton className="h-4 w-36 my-4" />}>
        <InfoVendedor vendedor={producto.vendedor} />
      </Suspense>

      <div className="mt-6 border-y border-border/60 py-5">
        <ProductDetalles
          tamano={`${producto.tamaño} ml`}
          genero={producto.genero}
        />
      </div>

      <div className="mt-8">
        <ProductActions perfumeId={producto.id} />
      </div>

      <div className="mt-10">
        <ProductDescription
          descripcion={
            producto.descripcion ||
            "Descubre las notas envolventes de esta fragancia exclusiva. Una composición pensada para destacar tu personalidad en cualquier ocasión."
          }
        />
      </div>
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
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase font-semibold tracking-[0.15em] text-muted-foreground">
        {marca}
      </span>
      <h1 className="text-[clamp(28px,4vw,40px)] font-serif font-normal text-foreground leading-[1.1] tracking-tight">
        {nombre}
      </h1>
    </div>
  );
}

async function ProductCalificacion({ idProducto }: { idProducto: string }) {
  try {
    const { total, promedio } = await obtenerResenaProducto(idProducto);
    if (!promedio || total === 0) return null;

    return (
      <div className="flex items-center gap-2 mt-4">
        <CalificacionEstrellas rating={promedio} />
        <span className="text-[13px] font-medium text-foreground ml-1">
          {promedio.toFixed(1)}
        </span>
        <span className="text-[13px] text-muted-foreground/80">
          · {total} reseñas
        </span>
      </div>
    );
  } catch (error) {
    return null;
  }
}

function ProductPrecio({ precio }: { precio: number }) {
  return (
    <div className="mt-6">
      <span className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
        {formatearPrecio(precio)}
      </span>
    </div>
  );
}

async function InfoVendedor({ vendedor }: { vendedor: string }) {
  try {
    const { total, promedio } = await obtenerResenaVendedor(vendedor);

    return (
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <p className="text-[13px] text-muted-foreground">
          Vendido por{" "}
          <span className="text-foreground font-medium cursor-pointer hover:text-accent transition-colors underline underline-offset-4">
            {vendedor}
          </span>
        </p>
        {total > 0 && (
          <div className="flex items-center gap-1 opacity-80">
            <span className="text-muted-foreground">|</span>
            <CalificacionEstrellas rating={promedio} />
            <span className="text-[11px] text-muted-foreground">({total})</span>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="mt-4">
        <p className="text-[13px] text-muted-foreground">
          Vendido por{" "}
          <span className="text-foreground font-medium cursor-pointer hover:text-accent transition-colors">
            {vendedor}
          </span>
        </p>
      </div>
    );
  }
}

function ProductDetalles({
  tamano,
  genero,
}: {
  tamano: string;
  genero: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5">
          Tamaño
        </p>
        <p className="text-[15px] font-medium text-foreground">{tamano}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5">
          Género
        </p>
        <p className="text-[15px] font-medium text-foreground capitalize">
          {genero}
        </p>
      </div>
    </div>
  );
}

function ProductActions({ perfumeId }: { perfumeId: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/checkout/envio?productoId=${perfumeId}`}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full text-[13px] uppercase tracking-wider font-semibold h-14 bg-foreground text-background hover:bg-foreground/90 transition-all rounded-sm",
        )}
      >
        Comprar ahora
      </Link>
      <BotonAgregarCarrito
        perfumeId={perfumeId}
        variant="outline"
        size="lg"
        className="w-full text-[13px] uppercase tracking-wider font-semibold h-14 border border-border bg-transparent text-foreground hover:border-accent hover:text-accent transition-all rounded-sm"
      />
    </div>
  );
}

function ProductDescription({ descripcion }: { descripcion: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] uppercase font-bold tracking-widest text-foreground">
        Acerca de la fragancia
      </h3>
      <p className="text-[14px] text-muted-foreground/90 leading-[1.7] font-light">
        {descripcion}
      </p>
    </div>
  );
}

function extraerIdDeSlug(slug: string): string | undefined {
  return slug.split("-").pop();
}
