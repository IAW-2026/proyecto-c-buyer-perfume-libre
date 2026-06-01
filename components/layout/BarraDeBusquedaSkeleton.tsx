import { Skeleton } from "@/components/ui/skeleton";

export function BarraDeBusquedaSkeleton() {
  return (
    <div className="flex justify-center w-full">
      <div className="relative w-full max-w-2xl">
        <Skeleton className="h-12 w-full rounded-md border-2" />
        <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}
