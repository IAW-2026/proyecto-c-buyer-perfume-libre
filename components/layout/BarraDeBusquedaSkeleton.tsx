import { Skeleton } from "@/components/ui/skeleton";

export function BarraDeBusquedaSkeleton() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Skeleton className="h-11 w-full rounded-sm bg-secondary/40 border border-border/10" />
    </div>
  );
}
