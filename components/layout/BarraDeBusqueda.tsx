"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BarraDeBusqueda() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [termino, setTermino] = useState(searchParams.get("q") ?? "");

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (termino.trim()) {
      params.set("q", termino.trim());
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center w-full">
      <form
        onSubmit={handleSearch}
        className="relative w-full max-w-xl mx-auto"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar marcas, notas olfativas..."
          className="w-full pl-11 pr-4 h-11 text-[13px] bg-secondary/30 border-border/40 focus-visible:ring-accent focus-visible:border-accent rounded-sm shadow-none transition-all placeholder:text-muted-foreground/60"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
      </form>
    </div>
  );
}
