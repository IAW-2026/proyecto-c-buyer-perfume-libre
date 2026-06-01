import { Loader2 } from "lucide-react";

export default function LoadingAdmin() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">
        Cargando panel de administración...
      </p>
    </div>
  );
}
