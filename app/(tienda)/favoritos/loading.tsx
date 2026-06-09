import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingFavoritos() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Favoritos</h1>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCardFavorito key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SkeletonCardFavorito() {
  return (
    <div className="flex flex-col sm:flex-row overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Skeleton de la Imagen */}
      <Skeleton className="h-48 w-full sm:h-40 sm:w-40 rounded-none" />

      {/* Skeleton de la Información */}
      <div className="flex flex-1 flex-col justify-center p-4 lg:p-6">
        <Skeleton className="h-3 w-16 mb-2" /> {/* Marca */}
        <Skeleton className="h-6 w-3/4 mb-4" /> {/* Nombre del perfume */}
        <Skeleton className="h-5 w-24" /> {/* Precio */}
      </div>

      {/* Skeleton de las Acciones */}
      <div className="flex flex-col justify-center gap-2 p-4 sm:border-l sm:border-slate-100 sm:w-48">
        <Skeleton className="h-10 w-full rounded-md" /> {/* Botón Carrito */}
        <Skeleton className="h-10 w-full rounded-md bg-slate-100" />{" "}
        {/* Botón Eliminar */}
      </div>
    </div>
  );
}
