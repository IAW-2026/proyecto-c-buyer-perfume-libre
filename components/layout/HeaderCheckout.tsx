import SiteBrand from "./SiteBrand";

export default function HeaderCheckout() {
  return (
    <header className="w-full border-b bg-background py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 relative">
        <div className="flex items-center justify-center relative min-h-12">
          <SiteBrand />
        </div>
      </div>
    </header>
  );
}
