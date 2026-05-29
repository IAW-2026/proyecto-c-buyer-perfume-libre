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
      <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar fragancias, marcas, notas..."
          className="w-full pl-10 h-12 text-lg shadow-sm border-2"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
      </form>
    </div>
  );
}
