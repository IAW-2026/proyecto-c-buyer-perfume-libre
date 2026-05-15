import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Header from "@/components/header";
import CalificacionEstrellas from "@/components/calificacionEstrellas";
import { generarUrl } from "@/lib/utils";
import { notFound, redirect } from "next/dist/client/components/navigation";
import { obtenerDetallePerfume } from "@/lib/api";
import { Perfume } from "@/schema/perfume.schema";
import { productoEstaEnFavoritos } from "@/actions/favoritos";
import { BotonFavorito } from "@/components/favoritos/BotonFavorito";
import { auth } from "@clerk/nextjs/server";
import { BotonAgregarCarrito } from "@/components/carrito/botonAgregarCarrito";

// TODO: Agregar skeleton mientras se carga el producto
export default async function ProductoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugCompleto } = await params;
  const idReal = extraerIdDeSlug(slugCompleto);

  // TODO: Manejar error cuando el perfume no exista
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
      <Header />

      <main className="container mx-auto px-4 py-12">
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
    <div className="lg:col-span-6 relative flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100/50 rounded-2xl p-8 min-h-125 border border-slate-200/50">
      <BotonFavorito perfumeId={id} esFavoritoInicial={estaEnFavoritos} />
      <Carousel className="w-full max-w-md">
        <CarouselContent>
          {imagenesGaleria.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square">
                <Image
                  src={img}
                  alt={nombre}
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

function ProductInformation({ producto }: { producto: Perfume }) {
  return (
    <div className="lg:col-span-6 flex flex-col gap-6 h-fit">
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
        <ProductEncabezado marca={producto.marca} nombre={producto.nombre} />

        {/* TODO: Cambiar por fetch a api */}
        <ProductCalificacion calificacion={producto.calificacion} />
      </div>

      <ProductPrecio precio={producto.precio} vendedor={producto.vendedor} />
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

//TODO: Hacer featch a feedback app para traer la calificación real del producto
function ProductCalificacion({ calificacion }: { calificacion: number }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-sm font-medium text-foreground">
        {calificacion.toFixed(1)}
      </span>
      <CalificacionEstrellas rating={calificacion} />
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
        ${precio.toLocaleString()}
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

// TODO: Agregar acciones
function ProductActions({ perfumeId }: { perfumeId: string }) {
  return (
    <div className="flex flex-col gap-3 py-4 border-y border-slate-200">
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
