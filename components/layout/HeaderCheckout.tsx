import SiteBrand from "./SiteBrand";

export default function HeaderCheckout() {
  return (
    <header className="w-full border-b border-border/60 bg-background py-4 sticky top-0 z-50 shadow-[0_1px_4px_rgba(28,21,16,0.03)]">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-center min-h-12 relative">
        <SiteBrand />
      </div>
    </header>
  );
}
