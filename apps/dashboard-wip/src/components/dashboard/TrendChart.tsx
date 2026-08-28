"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendDataPoint } from "@/types/dashboard";
import { BarChart3 } from "lucide-react";

interface TrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green
  AW02: "#29A9D6", // Blue
  AW03: "#FCE27A", // Secondary Yellow
  AW04: "#A8D437", // Light Green
  AW05: "#0B6B32", // Dark Green
  AW06: "#053916ff",
  AW07: "#89938D", // Gray
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const validValues = payload
    .map((p) => Number(p.value ?? 0))
    .filter((v) => !isNaN(v) && v > 0);

  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[210px]">
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
        <span>Umur Tanaman: <strong className="text-[#16823B] font-extrabold">{label} Bulan</strong></span>
      </div>

      <div className="flex flex-col gap-1.5">
        {payload.map((entry, index) => {
          const val = Number(entry.value ?? 0);
          const isMax = maxValue > 0 && val === maxValue;

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-[#5F6B63] font-medium">Wilayah {entry.name}:</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono ${
                    isMax
                      ? "text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                      : "text-[#17231B] font-semibold"
                  }`}
                >
                  {val.toLocaleString("id-ID")} Juta
                </span>
                {isMax && (
                  <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded uppercase tracking-tighter">
                    MAX
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-96 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#5F6B63]">Memuat diagram batang trend cost...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Trend Cost per Umur Tanaman (Diagram Batang)</h3>
            <p className="text-xs text-[#5F6B63]">Perbandingan diagram batang akumulasi cost per Ha berdasarkan umur tanaman (0 - 21 Bulan) per Wilayah</p>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEF" vertical={false} />
            <XAxis
              dataKey="umur"
              stroke="#5F6B63"
              fontSize={12}
              tickLine={false}
              label={{ value: "Umur Tanaman (Bulan)", position: "insideBottom", offset: -5, fill: "#5F6B63", fontSize: 11 }}
            />
            <YAxis
              stroke="#5F6B63"
              fontSize={12}
              tickLine={false}
              unit="M"
              label={{ value: "Cost / Ha (Juta Rp)", angle: -90, position: "insideLeft", offset: 10, fill: "#5F6B63", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
            {Object.keys(REGION_COLORS).map((region) => (
              <Bar
                key={region}
                dataKey={region}
                name={region}
                fill={REGION_COLORS[region]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
