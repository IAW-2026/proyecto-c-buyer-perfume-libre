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
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-foreground hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3.5 pb-4 pt-1">
        {items.map((item) => {
          const isChecked = seleccionados.includes(item);

          return (
            <div key={item} className="flex items-center space-x-3">
              <Checkbox
                id={`${paramName}-${item}`}
                checked={isChecked}
                onCheckedChange={(c) => handleCheckedChange(item, c as boolean)}
                className="h-4 w-4 rounded-full border border-[#1c1510] transition-colors cursor-pointer [&_svg]:hidden data-[state=unchecked]:bg-[#1c1510] data-[state=checked]:border-accent data-[state=checked]:bg-accent"
              />

              <Label
                htmlFor={`${paramName}-${item}`}
                className="cursor-pointer text-[13px] font-normal leading-none text-muted-foreground hover:text-foreground transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
                {suffix && (
                  <span className="ml-1 text-muted-foreground/70">
                    {suffix}
                  </span>
                )}
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

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const noSpinnersClass =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <AccordionItem value="Precio" className="border-none">
      <AccordionTrigger className="py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-foreground hover:no-underline">
        Precio
      </AccordionTrigger>
      <AccordionContent className="pb-4 pt-1">
        <form onSubmit={aplicarPrecio} className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Mínimo"
            className={`h-9 text-[13px] bg-secondary/30 border-border/60 focus-visible:ring-accent ${noSpinnersClass}`}
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min="0"
            placeholder="Máximo"
            className={`h-9 text-[13px] bg-secondary/30 border-border/60 focus-visible:ring-accent ${noSpinnersClass}`}
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
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

export default function SidebarFiltros({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full ${
        isOpen
          ? "w-68 max-h-[calc(100vh-160px)] opacity-100"
          : "w-0 max-h-0 opacity-0"
      }`}
    >
      <div className="w-64 pb-16 pr-2">
        <Accordion
          multiple
          defaultValue={["Marca", "Género", "Precio", "Tamaño"]}
          className="w-full space-y-1"
        >
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
      </div>
    </div>
  );
}
