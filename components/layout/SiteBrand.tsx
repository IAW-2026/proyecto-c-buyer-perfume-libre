import Link from "next/link";

export default function SiteBrand() {
  return (
    <Link
      href="/"
      aria-label="PerfumeLibre - Ir a inicio"
      className="text-4xl md:text-5xl font-extrabold tracking-tighter"
    >
      Perfume<span className="text-primary">Libre</span>
    </Link>
  );
}
