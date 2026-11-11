export default function HeroBanner() {
  return (
    <div className="relative left-1/2 right-1/2 mb-6 w-screen -translate-x-1/2 overflow-hidden bg-[#15100c] px-4 pb-16 pt-20 text-center shadow-md">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60" />

      <div
        className="pointer-events-none absolute left-1/2 -top-37.5 h-100 w-150 -translate-x-1/2 rounded-full blur-[90px] opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,110,0.35) 0%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute -bottom-25 -right-12.5 h-87.5 w-87.5 rounded-full blur-[80px] opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,110,0.25) 0%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute top-1/4 -left-25 h-62.5 w-62.5 rounded-full blur-[90px] opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-accent/90">
          Fragancias auténticas · Envío en 24h · Garantía de originalidad
        </p>

        <h1 className="mb-4 font-serif text-[clamp(32px,5.5vw,56px)] font-normal leading-[1.15] tracking-tight text-[#FAF8F4]">
          Descubre tu firma{" "}
          <em className="font-serif font-normal italic text-accent">
            olfativa
          </em>
        </h1>

        <p className="max-w-xl text-[16px] font-light leading-relaxed text-[#FAF8F4]/70">
          Mas de 200 vendedores verificados. Explora, compara y encuentra tu
          aroma ideal con total confianza.
        </p>
      </div>
    </div>
  );
}
