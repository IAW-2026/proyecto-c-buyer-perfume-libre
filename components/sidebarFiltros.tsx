"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import React from "react";

// Funcion de acordion generica para lista check
function AcordionCheckList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox id={item} />
            <Label htmlFor={item}>{item}</Label>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

// Funcion de acordion para filtro de precio con slider
// TODO: No me gusta el slider con 2 desplazadores, buscar alternativa o customizarlo.
function AcordionPrecioSlider({
  title,
  precioMin,
  precioMax,
  step,
}: {
  title: string;
  precioMin: number;
  precioMax: number;
  step: number;
}) {
  const [value, setValue] = React.useState([precioMin, precioMax]);

  return (
    <AccordionItem value="item-2">
      <AccordionTrigger className="w-full">
        <div className="flex w-full items-center justify-between gap-2">
          <Label>{title}</Label>
          <span className="text-sm text-muted-foreground">
            {`$${value[0].toLocaleString()} - $${value[1].toLocaleString()}`}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 px-2">
        <Slider
          value={value}
          onValueChange={(value) => setValue(value as number[])}
          max={precioMax}
          step={step}
          className="mx-auto w-full max-w-xs"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>${precioMin.toLocaleString()}</span>
          <span>${precioMax.toLocaleString()}</span>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// TODO: reemplazar con fetch a API seller.
const marcas = ["Marca 1", "Marca 2", "Marca 3", "Marca 4"];

export default function SidebarFiltros() {
  return (
    <aside className="w-64 shrink-0 hidden md:block border-r p-6 h-[calc(100vh-140px)] sticky top-35 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Filtros</h2>

      <Accordion>
        {/* FILTRO: MARCA */}
        <AcordionCheckList title="Marca" items={marcas} />

        {/* FILTRO: PRECIO */}
        <AcordionPrecioSlider
          title="Precio"
          precioMin={0}
          precioMax={100}
          step={10}
        />

        {/* FILTRO: GÉNERO */}
        <AcordionCheckList
          title="Género"
          items={["Masculino", "Femenino", "Unisex"]}
        />
      </Accordion>
    </aside>
  );
}
