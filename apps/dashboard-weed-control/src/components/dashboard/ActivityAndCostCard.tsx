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
import { Layers, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { formatCurrencyRp, formatDecimal2 } from "@/lib/formatters";

interface ActivityAndCostCardProps {
  selectedLocation: LocationItem | null;
  activities: ActivityCostItem[];
  chartData: AgeCostDataPoint[];
  loading?: boolean;
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
              <span className="text-[#5F6B63] font-semibold">Kumulatif Umur 1..n:</span>
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

  const totalBiayaSemuaAktivitas = activities.reduce((acc, curr) => acc + curr.totalBiaya, 0);
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
              <h3 className="font-extrabold text-sm sm:text-base text-[#17231B]">
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
            <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Aktivitas</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya</th>
                    <th className="py-2.5 px-3 text-right">Cost / Ha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60">
                  {activities.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F7F9F7] transition-colors">
                      <td className="py-2 px-3 font-semibold text-[#17231B]">{item.aktivitas}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#5F6B63]">
                        {formatCurrencyRp(item.totalBiaya)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#16823B]">
                        {formatCurrencyRp(item.costHa)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#F7F9F7] font-bold text-[#17231B] border-t-2 border-[#DDE5DF] sticky bottom-0">
                  <tr>
                    <td className="py-2 px-3 uppercase text-[11px]">Total ({activities.length})</td>
                    <td className="py-2 px-3 text-right font-mono text-[#17231B]">
                      {formatCurrencyRp(totalBiayaSemuaAktivitas)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#16823B]">
                      {formatCurrencyRp(totalCostHaSemuaAktivitas)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="text-[10px] text-[#89938D] mt-3 pt-2 border-t border-[#DDE5DF]/60 flex items-center justify-between">
          <span>* Cost/Ha = Total Biaya / Luas Lokasi</span>
          <span>{activities.length} Aktivitas</span>
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
                <h3 className="font-extrabold text-sm sm:text-base text-[#17231B]">
                  Trend Cost & Kumulatif per Umur
                </h3>
                <p className="text-[11px] text-[#5F6B63]">
                  Cost/HA per Umur (Bar Hijau) dan Akumulasi Kumulatif Umur 1..n (Garis Oranye)
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#5F6B63]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#16823B]" /> Bar: Cost/Ha
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E57A00]" /> Line: Kumulatif
              </span>
            </div>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="h-72 flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-[#5F6B63]">Memuat grafik cost per umur...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
              <AlertCircle className="w-6 h-6 text-[#89938D] mb-1" />
              <p className="text-xs text-[#5F6B63]">Tidak ada data cost per umur untuk lokasi ini.</p>
            </div>
          ) : (
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 12, right: 16, left: 8, bottom: 20 }}
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
                  <YAxis
                    stroke="#5F6B63"
                    fontSize={11}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
                        : val.toLocaleString("id-ID")
                    }
                    tickLine={false}
                    width={58}
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
                    dataKey="costHa"
                    name="Cost/Ha per Umur"
                    fill="#16823B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Line
                    type="monotone"
                    dataKey="kumulatifCostHa"
                    name="Kumulatif Cost/Ha"
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
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#16823B]" />
            <span>Grafik dihitung dari tabel cost_umur dibagi luas kebun {formatDecimal2(selectedLocation.luas)} Ha</span>
          </div>
          <span className="font-mono">Satuan: Rp / Ha</span>
        </div>
      </div>
    </div>
  );
}

