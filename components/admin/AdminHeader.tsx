import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="w-full border-b bg-background py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between min-h-12">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/"
            aria-label="PerfumeLibre - Panel de Control"
            className="text-3xl md:text-4xl font-extrabold tracking-tighter"
          >
            Perfume<span className="text-primary">Libre</span>
          </Link>

          <span className="text-[10px] md:text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded font-bold tracking-widest uppercase shadow-sm mt-1">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
