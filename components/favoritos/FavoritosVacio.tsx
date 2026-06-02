import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";

export default function FavoritosVacio() {
  return (
    <div className="bg-white p-12 rounded-xl text-center shadow-sm">
      <p className="text-muted-foreground mb-4">
        No tenés productos guardados como favoritos.
      </p>
      <Link href="/" className={buttonVariants()}>
        Explorar perfumes
      </Link>
    </div>
  );
}
