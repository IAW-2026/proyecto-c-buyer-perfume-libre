"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatearPrecio } from "@/lib/utils";

interface VentasChartProps {
  data: { mes: string; ventas: number }[];
}

export function VentasChart({ data }: VentasChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="mes"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatearPrecio(value)}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value: any) => [
            formatearPrecio(Number(value || 0)),
            "Ganancia",
          ]}
        />
        <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
