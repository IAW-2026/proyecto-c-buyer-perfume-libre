// components/producto/SeccionResenasSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SeccionResenasSkeleton() {
  return (
    <div className="mt-16 lg:mt-24 pt-12 lg:pt-16 border-t border-border/40 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <Skeleton className="h-6 w-6 rounded-full bg-secondary/60" />
          <Skeleton className="h-8 w-64 bg-secondary/60" />
        </div>

        <Skeleton className="h-44 w-full rounded-sm bg-secondary/30" />

        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-40 mb-6 bg-secondary/60" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-sm bg-secondary/30" />
            <Skeleton className="h-32 w-full rounded-sm bg-secondary/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
