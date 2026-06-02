"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { pesosACentavos } from "@/lib/utils";

function AcordionCheckList({
  title,
  paramName,
  items,
  suffix = "",
}: {
  title: string;
  paramName: string;
  items: string[];
  suffix?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const seleccionadosEnUrl = searchParams.getAll(paramName);

  const [seleccionados, setSeleccionados] =
    useState<string[]>(seleccionadosEnUrl);

  React.useEffect(() => {
    setSeleccionados(seleccionadosEnUrl);
  }, [searchParams, paramName]);

  const handleCheckedChange = (item: string, isChecked: boolean) => {
    if (isChecked) {
      setSeleccionados((prev) => [...prev, item]);
    } else {
      setSeleccionados((prev) => prev.filter((i) => i !== item));
    }

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (isChecked) {
      params.append(paramName, item);
    } else {
      params.delete(paramName);
      const resto = seleccionadosEnUrl.filter((i) => i !== item);
      resto.forEach((r) => params.append(paramName, r));
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-base font-semibold">
        {title}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pt-2">
        {items.map((item) => {
          const isChecked = seleccionados.includes(item);

          return (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`${paramName}-${item}`}
                checked={isChecked}
                onCheckedChange={(c) => handleCheckedChange(item, c as boolean)}
              />
              <Label
                htmlFor={`${paramName}-${item}`}
                className="text-sm cursor-pointer"
              >
                {item}
                {suffix}
              </Label>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

function FiltroPrecio() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [min, setMin] = useState(searchParams.get("precioMin") ?? "");
  const [max, setMax] = useState(searchParams.get("precioMax") ?? "");

  const aplicarPrecio = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    let valMin = min ? pesosACentavos(min) : null;
    let valMax = max ? pesosACentavos(max) : null;

    if (valMin !== null && valMin < 0) valMin = 0;
    if (valMax !== null && valMax < 0) valMax = 0;

    if (valMin !== null && valMax !== null && valMin > valMax) {
      const temp = valMin;
      valMin = valMax;
      valMax = temp;
      setMin(valMin.toString());
      setMax(valMax.toString());
    }

    if (valMin !== null) params.set("precioMin", valMin.toString());
    else params.delete("precioMin");

    if (valMax !== null) params.set("precioMax", valMax.toString());
    else params.delete("precioMax");

    router.push(`${pathname}?${params.toString()}`);
  };

  const noSpinnersClass =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <AccordionItem value="Precio">
      <AccordionTrigger className="text-base font-semibold">
        Precio
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <form onSubmit={aplicarPrecio} className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Mínimo"
            className={`h-8 text-xs ${noSpinnersClass}`}
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">-</span>
          <Input
            type="number"
            min="0"
            placeholder="Máximo"
            className={`h-8 text-xs ${noSpinnersClass}`}
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}

const MARCAS_MOCK = [
  "Dior",
  "Chanel",
  "Paco Rabanne",
  "Versace",
  "Calvin Klein",
  "Carolina Herrera",
];
const TAMANOS_MOCK = ["30", "50", "75", "100", "200"];
const GENEROS_MOCK = ["Hombre", "Mujer", "Unisex"];

export default function SidebarFiltros() {
  return (
    <aside className="w-64 shrink-0 hidden md:block border-r pr-2 h-[calc(100vh-160px)] overflow-y-auto sticky top-24 pb-16 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
      <h2 className="font-bold text-xl mb-4 tracking-tight pl-2">Filtros</h2>

      <Accordion multiple defaultValue={[]}>
        <AcordionCheckList
          title="Marca"
          paramName="marca"
          items={MARCAS_MOCK}
        />
        <AcordionCheckList
          title="Género"
          paramName="genero"
          items={GENEROS_MOCK}
        />
        <FiltroPrecio />
        <AcordionCheckList
          title="Tamaño"
          paramName="tamano"
          items={TAMANOS_MOCK}
          suffix="ml"
        />
      </Accordion>
    </aside>
  );
}
