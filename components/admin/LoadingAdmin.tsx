import { Loader2 } from "lucide-react";

export default function LoadingAdmin({ texto }: { texto: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.5} />
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {texto}
      </p>
    </div>
  );
}
