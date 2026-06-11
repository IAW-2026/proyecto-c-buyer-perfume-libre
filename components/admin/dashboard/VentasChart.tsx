"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatearPrecio } from "@/lib/utils";

interface VentasChartProps {
  data: any[];
}

export function VentasChart({ data }: VentasChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="mes"
          stroke="#888888"
          fontSize={11}
          fontWeight={600}
          tickLine={false}
          axisLine={false}
          className="uppercase tracking-widest"
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatearPrecio(value)}
        />
        <Tooltip
          cursor={{ fill: "rgba(201,169,110,0.05)" }}
          contentStyle={{
            backgroundColor: "#15100c",
            border: "1px solid rgba(201,169,110,0.2)",
            borderRadius: "4px",
            color: "#FAF8F4",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
          itemStyle={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#c2a679",
          }}
          labelStyle={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#888888",
            marginBottom: "4px",
          }}
          formatter={(value: any) => [
            formatearPrecio(Number(value || 0)),
            "Facturación",
          ]}
        />
        <Bar dataKey="ventas" fill="#c2a679" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
