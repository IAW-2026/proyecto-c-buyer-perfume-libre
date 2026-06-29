import SiteBrand from "../layout/SiteBrand";

export default function AdminHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-card py-4 sticky top-0 z-50 shadow-[0_1px_4px_rgba(28,21,16,0.03)]">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between min-h-12">
        <div className="flex items-center gap-4">
          <SiteBrand />

          <span className="text-[9px] md:text-[10px] bg-foreground text-background px-2.5 py-1 rounded-sm font-bold tracking-[0.15em] uppercase mt-0.5">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
