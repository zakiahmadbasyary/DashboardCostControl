"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ActivityCostItem, AgeCostDataPoint, LocationItem } from "@/types/dashboard";
import { Layers, TrendingUp, AlertCircle, Sparkles, X } from "lucide-react";
import { formatCurrencyRp, formatDecimal2 } from "@/lib/formatters";

interface ActivityAndCostCardProps {
  selectedLocation: LocationItem | null;
  activities: ActivityCostItem[];
  chartData: AgeCostDataPoint[];
  loading?: boolean;
  selectedActivity?: string | null;
  onSelectActivity?: (activityName: string) => void;
}

interface CustomComboTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const CustomComboTooltip = ({ active, payload, label }: CustomComboTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const costHaItem = payload.find((p) => p.dataKey === "costHa");
  const kumulatifItem = payload.find((p) => p.dataKey === "kumulatifCostHa");

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-xl text-xs min-w-[210px] z-30">
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF]">
        Umur Tanaman: <strong className="text-[#16823B] font-extrabold">{label} Bulan</strong>
      </div>
      <div className="flex flex-col gap-2">
        {costHaItem && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#16823B] shrink-0" />
              <span className="text-[#5F6B63] font-semibold">Cost / Ha (Bulan ini):</span>
            </div>
            <span className="font-mono font-bold text-[#16823B]">
              {formatCurrencyRp(costHaItem.value)}
            </span>
          </div>
        )}

        {kumulatifItem && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#DDE5DF]/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E57A00] shrink-0" />
              <span className="text-[#5F6B63] font-semibold">Trend Cost:</span>
            </div>
            <span className="font-mono font-bold text-[#E57A00]">
              {formatCurrencyRp(kumulatifItem.value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ActivityAndCostCard({
  selectedLocation,
  activities,
  chartData,
  loading,
  selectedActivity,
  onSelectActivity,
}: ActivityAndCostCardProps) {
  if (!selectedLocation) {
    return (
      <div className="bg-white border border-dashed border-[#DDE5DF] rounded-2xl p-6 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-[#F7F9F7] text-[#89938D] border border-[#DDE5DF]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#5F6B63]">
            Pilih salah satu baris lokasi pada tabel{" "}
            <strong className="text-[#16823B]">List Lokasi</strong> untuk melihat rincian aktivitas dan grafik per umur.
          </p>
        </div>
      </div>
    );
  }

  const totalCostHaSemuaAktivitas = activities.reduce((acc, curr) => acc + curr.costHa, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* ================= BAGIAN KIRI: 35% ================= */}
      <div className="w-full lg:w-[35%] shrink-0 bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#DDE5DF]/70">
            <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-md md:text-base text-[#17231B]">
                Rincian Aktivitas Weed Control
              </h3>
              <p className="text-[11px] text-[#5F6B63]">
                Lokasi <strong className="text-[#16823B]">{selectedLocation.lokasi}</strong> (Luas:{" "}
                {formatDecimal2(selectedLocation.luas)} Ha)
              </p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-[#5F6B63]">Memuat aktivitas...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
              <p className="text-xs text-[#5F6B63]">Tidak ada rincian aktivitas untuk lokasi ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] max-h-[375px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3">Aktivitas</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost / Ha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60">
                  {activities.map((item, idx) => {
                    const isSelected = selectedActivity === item.aktivitas;
                    return (
                      <tr
                        key={idx}
                        onClick={() => onSelectActivity?.(item.aktivitas)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? "bg-[#EAF3EC] border-l-4 border-[#16823B]"
                            : "hover:bg-[#F7F9F7]"
                        }`}
                        title={`Klik untuk melihat timeline aktivitas ${item.aktivitas}`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#17231B]">
                          <div className="flex items-center gap-1.5">
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16823B] shrink-0 animate-pulse" />
                            )}
                            <span
                              className={
                                isSelected
                                  ? "text-[#16823B] font-bold"
                                  : "group-hover:text-[#16823B] transition-colors"
                              }
                            >
                              {item.aktivitas}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {formatCurrencyRp(item.costHa)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#F7F9F7] font-bold text-[#17231B] border-t-2 border-[#DDE5DF] sticky bottom-0">
                  <tr>
                    <td className="py-2.5 px-3 uppercase text-[11px]">Total ({activities.length})</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#16823B] whitespace-nowrap">
                      {formatCurrencyRp(totalCostHaSemuaAktivitas)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="text-[10px] text-[#89938D] mt-3 pt-2 border-t border-[#DDE5DF]/60 flex items-center justify-between">
          <span>{activities.length} Aktivitas</span>
          {selectedActivity && onSelectActivity && (
            <button
              type="button"
              onClick={() => onSelectActivity(selectedActivity)}
              className="text-[#16823B] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Reset Filter ({selectedActivity})</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ================= BAGIAN KANAN: 65% ================= */}
      <div className="w-full lg:w-[65%] flex-1 bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDE5DF]/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-md md:text-base text-[#17231B]">
                  Trend Cost per Umur
                </h3>
                <p className="text-[11px] text-[#5F6B63]">
                  Cost/Ha Bulanan (Sumbu Kiri - Bar Hijau) dan Trend Cost (Sumbu Kanan - Garis Oranye)
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-[#5F6B63]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#16823B]" /> Kiri: Cost/Ha
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E57A00]" /> Kanan: Trend
              </span>
            </div>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="h-80 sm:h-[360px] lg:h-[375px] flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-[#5F6B63]">Memuat grafik cost per umur...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-80 sm:h-[360px] lg:h-[375px] flex flex-col items-center justify-center text-center p-6 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
              <AlertCircle className="w-6 h-6 text-[#89938D] mb-1" />
              <p className="text-xs text-[#5F6B63]">Tidak ada data cost per umur untuk lokasi ini.</p>
            </div>
          ) : (
            <div className="h-80 sm:h-[360px] lg:h-[375px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 8, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFEB" />
                  <XAxis
                    dataKey="umur"
                    tickLine={false}
                    stroke="#5F6B63"
                    fontSize={11}
                    label={{
                      value: "Umur Tanaman (Bulan)",
                      position: "insideBottom",
                      offset: -12,
                      fontSize: 11,
                      fill: "#5F6B63",
                      fontWeight: 600,
                    }}
                  />
                  {/* Sumbu Kiri: Cost/Ha Bulanan */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={[0, "auto"]}
                    stroke="#5F6B63"
                    fontSize={11}
                    tickFormatter={(val) =>
                      val === 0
                        ? "0"
                        : val >= 1000000
                        ? `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
                        : val.toLocaleString("id-ID")
                    }
                    tickLine={false}
                    width={54}
                  />
                  {/* Sumbu Kanan: Trend Cost/Ha */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, "auto"]}
                    stroke="#5F6B63"
                    fontSize={11}
                    tickFormatter={(val) =>
                      val === 0
                        ? "0"
                        : val >= 1000000
                        ? `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
                        : val.toLocaleString("id-ID")
                    }
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip content={<CustomComboTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="costHa"
                    name="Cost/Ha (Bulanan)"
                    fill="#16823B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="kumulatifCostHa"
                    name="Trend Cost"
                    stroke="#E57A00"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#E57A00" }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#5F6B63] pt-2 border-t border-[#DDE5DF]/60">
          <span className="font-mono">Sumbu Kiri: Cost/Ha Bulanan (Rp)</span>
          <span className="font-mono">Sumbu Kanan: Trend Cost (Rp)</span>
        </div>
      </div>
    </div>
  );
}

