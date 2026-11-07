"use client";

import React, { useMemo } from "react";
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
  Cell,
  LabelList,
} from "recharts";
import { BarChart3, MapPin, Users, Sprout, MousePointerClick, Calendar, MoveHorizontal } from "lucide-react";
import { formatNumberId } from "@/lib/formatters";

export interface MonthlyLocationMetric {
  month: number;
  monthName: string;
  tk: number;
  batang: number;
}

interface LocationMonthlyChartProps {
  selectedLocation: { wilayah: string; lokasi: string } | null;
  selectedYear: number;
  data: MonthlyLocationMetric[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  loading?: boolean;
}

// Skema warna grafik:
// - TK: Bar Hijau Solid (#16823B) pada Sumbu Kanan
// - Batang: Garis / Dash Horizontal Kuning (#E5C959, warna kuning Filter Utama) pada Sumbu Kiri
const TK_COLOR = "#16823B";
const TK_ACTIVE_COLOR = "#0E5C28";
const BATANG_COLOR = "#E5C959"; // Kuning Filter Utama GGF

const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function LocationMonthlyChart({
  selectedLocation,
  selectedYear,
  data = [],
  selectedMonth,
  onSelectMonth,
  loading,
}: LocationMonthlyChartProps) {
  // Hitung total akumulasi tahunan lokasi ini
  const totals = useMemo(() => {
    let sumTk = 0;
    let sumBatang = 0;
    for (const d of data) {
      sumTk += d.tk || 0;
      sumBatang += d.batang || 0;
    }
    const ratio = sumTk > 0 ? sumBatang / sumTk : 0;
    return {
      sumTk,
      sumBatang,
      ratio: Number(ratio.toFixed(1)),
    };
  }, [data]);

  // Cek apakah ada data di tahun ini untuk lokasi ini
  const hasData = totals.sumTk > 0 || totals.sumBatang > 0;

  // Hitung batas maksimal domain sumbu Y kiri (Batang) dan kanan (TK) secara proporsional
  const { maxTkDomain, maxBatangDomain } = useMemo(() => {
    let maxTk = 0;
    let maxBatang = 0;
    for (const d of data) {
      if ((d.tk || 0) > maxTk) maxTk = d.tk;
      if ((d.batang || 0) > maxBatang) maxBatang = d.batang;
    }

    // Beri margin atas ~18% agar data label di atas bar tidak terpotong
    const tkTarget = Math.max(maxTk * 1.18, 20);
    const tkStep = tkTarget > 100 ? 40 : 20;
    const roundedTk = Math.ceil(tkTarget / tkStep) * tkStep;

    const batangTarget = Math.max(maxBatang * 1.18, 10000);
    const batangStep = batangTarget > 50000 ? 10000 : 5000;
    const roundedBatang = Math.ceil(batangTarget / batangStep) * batangStep;

    return {
      maxTkDomain: roundedTk,
      maxBatangDomain: roundedBatang,
    };
  }, [data]);

  // Custom marker dash horizontal tebal untuk Batang (sesuai gambar referensi)
  const renderCustomDashDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;
    const dashWidth = 32;
    const dashHeight = 5;
    const month = payload?.month;
    return (
      <rect
        x={cx - dashWidth / 2}
        y={cy - dashHeight / 2}
        width={dashWidth}
        height={dashHeight}
        fill={BATANG_COLOR}
        stroke="#C9AE40"
        strokeWidth={0.5}
        rx={1}
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (month) onSelectMonth(month);
        }}
        className="hover:opacity-80 transition-opacity"
      />
    );
  };

  // Custom data label di atas Bar TK (menampilkan angka jika > 0, atau "-" jika 0)
  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (x === undefined || y === undefined || width === undefined) return null;
    const labelText = value && value > 0 ? formatNumberId(value, 0) : "-";
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#17231B"
        textAnchor="middle"
        fontSize={10}
        fontWeight={value && value > 0 ? "600" : "400"}
        fontFamily="sans-serif"
      >
        {labelText}
      </text>
    );
  };

  // Custom XAxis Tick dengan indikator visual bulan aktif & event klik langsung ke filter utama
  const renderCustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const month = payload.index + 1;
    const monthName = payload.value;
    const isCurrent = month === selectedMonth;

    return (
      <g
        transform={`translate(${x},${y})`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMonth(month);
        }}
        className="cursor-pointer group"
      >
        {isCurrent && (
          <rect
            x={-18}
            y={3}
            width={36}
            height={20}
            rx={5}
            fill="#16823B"
            className="shadow-xs"
          />
        )}
        <text
          x={0}
          y={isCurrent ? 17 : 15}
          textAnchor="middle"
          fill={isCurrent ? "#FFFFFF" : "#17231B"}
          fontSize={11}
          fontWeight={isCurrent ? "bold" : "500"}
          className="group-hover:fill-[#16823B] transition-colors"
        >
          {monthName}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs font-sans">
      {/* ── Top Bar Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#DDE5DF]/60 pb-3.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-[#17231B] leading-tight">
                Grafik Analisa Bulanan Lokasi:{" "}
                <span className="text-[#16823B] font-mono">
                  {selectedLocation ? `${selectedLocation.lokasi} (${selectedLocation.wilayah})` : "-"}
                </span>
              </h3>
              {selectedLocation && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                    Tahun {selectedYear}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16823B] text-white flex items-center gap-1 shadow-2xs">
                    <Calendar className="w-3 h-3 text-white" />
                    <span>Bulan Aktif: {MONTH_NAMES_FULL[selectedMonth - 1] || `Bulan ${selectedMonth}`}</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#5F6B63] mt-0.5 flex items-center gap-1 flex-wrap">
              <span>Perbandingan Tenaga Kerja (TK) &amp; Batang Bibit per bulan.</span>
              <span className="inline-flex items-center gap-1 text-[#16823B] font-semibold bg-[#16823B]/10 px-1.5 py-0.2 rounded">
                <MousePointerClick className="w-3 h-3" />
                Klik batang / nama bulan untuk mengubah filter utama dashboard
              </span>
            </p>
          </div>
        </div>

        {/* Info ringkasan tahunan */}
        {hasData && (
          <div className="flex items-center gap-3 bg-[#F7F9F7] px-3.5 py-2 rounded-xl border border-[#DDE5DF] self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-2">
              <Users className="w-3.5 h-3.5 text-[#16823B]" />
              <div>
                <div className="text-[10px] text-[#5F6B63] leading-none">Total TK</div>
                <div className="font-mono font-bold text-[#16823B] text-xs">
                  {formatNumberId(totals.sumTk, 1)}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-[#DDE5DF]" />
            <div className="flex items-center gap-1.5 px-2">
              <Sprout className="w-3.5 h-3.5 text-[#9A7D18]" />
              <div>
                <div className="text-[10px] text-[#5F6B63] leading-none">Total Batang</div>
                <div className="font-mono font-bold text-[#9A7D18] text-xs">
                  {formatNumberId(totals.sumBatang, 0)}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-[#DDE5DF]" />
            <div className="px-2">
              <div className="text-[10px] text-[#5F6B63] leading-none">Rata-rata Batang/TK</div>
              <div className="font-mono font-bold text-[#16823B] text-xs">
                {totals.ratio > 0 ? `${formatNumberId(totals.ratio, 1)}` : "-"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Chart Container ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-xs text-[#5F6B63]">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin" />
          <span>Memuat data grafik lokasi...</span>
        </div>
      ) : !selectedLocation ? (
        <div className="py-16 text-center text-xs text-[#5F6B63]">
          <MapPin className="w-8 h-8 text-[#CBE0D1] mx-auto mb-2" />
          <p className="font-bold text-[#17231B] text-sm">Belum ada lokasi yang dipilih</p>
          <p className="mt-1">
            Klik salah satu baris di <strong>Tabel Detail Seluruh Lokasi</strong> di atas untuk melihat grafik.
          </p>
        </div>
      ) : !hasData ? (
        <div className="py-16 text-center text-xs text-[#5F6B63]">
          <BarChart3 className="w-8 h-8 text-[#CBE0D1] mx-auto mb-2" />
          <p className="font-bold text-[#17231B] text-sm">
            Tidak ada transaksi di lokasi {selectedLocation.lokasi} pada tahun {selectedYear}
          </p>
          <p className="mt-1">
            Silakan pilih lokasi lain yang memiliki aktivitas sulam pada tabel di atas.
          </p>
        </div>
      ) : (
        <div className="w-full">
          {/* Petunjuk Geser Horizontal Khusus Layar Mobile */}
          <div className="flex sm:hidden items-center justify-between text-[11px] text-[#5F6B63] mb-2 px-0.5">
            <span className="flex items-center gap-1.5 font-medium text-[#17231B]">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
              <span>Geser grafik ke samping untuk melihat 12 bulan</span>
            </span>
            <span className="text-[10px] font-semibold bg-[#EAF3EC] text-[#16823B] px-2 py-0.5 rounded border border-[#CBE0D1]">
              12 Bulan
            </span>
          </div>

          {/* Wrapper Scrollable Horizontal di Layar Mobile, Full Width di Layar Desktop */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
            <div className="h-[290px] sm:h-[320px] min-w-[660px] sm:min-w-full w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 25, right: 25, bottom: 10, left: 15 }}
                  onClick={(state: any) => {
                    if (!state) return;
                    let clickedMonth: number | null = null;
                    if (state.activePayload && state.activePayload.length > 0) {
                      clickedMonth = state.activePayload[0].payload.month;
                    }
                    if (!clickedMonth && typeof state.activeTooltipIndex === "number") {
                      clickedMonth = data[state.activeTooltipIndex]?.month;
                    }
                    if (clickedMonth) {
                      onSelectMonth(clickedMonth);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <CartesianGrid stroke="#E5E5E5" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    stroke="#17231B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#4B5563" }}
                    tick={renderCustomXAxisTick}
                  />

                  {/* Sumbu Y Kiri: Batang Bibit (Garis / Dash Oranye) */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, maxBatangDomain]}
                    tickFormatter={(v) => formatNumberId(v, 0)}
                  />

                  {/* Sumbu Y Kanan: Tenaga Kerja (TK - Bar Biru) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, maxTkDomain]}
                    tickFormatter={(v) => formatNumberId(v, 0)}
                  />

                  <Tooltip content={<CustomLocationTooltip activeMonth={selectedMonth} />} />

                  {/* Legend di Bawah Tengah: [■ TK (Hijau)]  [― Batang (Kuning)] */}
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 16 }}
                    content={() => (
                      <div className="flex items-center justify-center gap-6 text-xs text-[#17231B] font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 bg-[#16823B] inline-block rounded-xs" />
                          <span className="font-semibold text-[#16823B]">TK</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-1.5 bg-[#E5C959] border border-[#C9AE40] inline-block rounded-xs" />
                          <span className="font-semibold text-[#8C7118]">Batang</span>
                        </div>
                      </div>
                    )}
                  />

                  {/* 1. Bar: Tenaga Kerja (TK) pada Sumbu Kanan */}
                  <Bar
                    yAxisId="right"
                    dataKey="tk"
                    name="TK"
                    barSize={34}
                    isAnimationActive={false}
                    cursor="pointer"
                    onClick={(barData: any) => {
                      const m = barData?.month;
                      if (m) onSelectMonth(m);
                    }}
                  >
                    <LabelList dataKey="tk" content={renderBarLabel} />
                    {data.map((entry) => {
                      const isCurrent = entry.month === selectedMonth;
                      return (
                        <Cell
                          key={`tk-${entry.month}`}
                          cursor="pointer"
                          onClick={(e: any) => {
                            e?.stopPropagation?.();
                            onSelectMonth(entry.month);
                          }}
                          fill={isCurrent ? TK_ACTIVE_COLOR : TK_COLOR}
                          stroke={isCurrent ? "#17231B" : undefined}
                          strokeWidth={isCurrent ? 2 : 0}
                          className="cursor-pointer transition-opacity hover:opacity-85"
                        />
                      );
                    })}
                  </Bar>

                  {/* 2. Marker Dash: Batang Bibit pada Sumbu Kiri */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="batang"
                    name="Batang"
                    stroke="transparent"
                    dot={renderCustomDashDot}
                    activeDot={{ r: 5, fill: BATANG_COLOR }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip dengan info Tenaga Kerja, Batang, dan Rasio ──
function CustomLocationTooltip({ active, payload, label, activeMonth }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const tk = Number(data.tk) || 0;
  const batang = Number(data.batang) || 0;
  const ratio = tk > 0 ? (batang / tk).toFixed(1) : "-";
  const isSelected = data.month === activeMonth;

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-[#DDE5DF] text-xs font-sans space-y-1.5 min-w-[190px]">
      <div className="flex items-center justify-between border-b border-[#DDE5DF]/60 pb-1.5">
        <span className="font-extrabold text-[#17231B]">{data.monthName}</span>
        {isSelected ? (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#16823B] text-white">
            Bulan Aktif
          </span>
        ) : (
          <span className="text-[10px] text-[#16823B] font-semibold">Klik untuk pilih</span>
        )}
      </div>

      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex items-center justify-between text-[#16823B]">
          <span className="font-sans font-medium text-[#5F6B63]">Tenaga Kerja:</span>
          <span className="font-bold">{formatNumberId(tk, 1)} TK</span>
        </div>
        <div className="flex items-center justify-between text-[#8C7118]">
          <span className="font-sans font-medium text-[#5F6B63]">Batang Bibit:</span>
          <span className="font-bold">{formatNumberId(batang, 0)} btg</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#DDE5DF]/60 text-[#17231B]">
          <span className="font-sans font-medium text-[#5F6B63]">Batang / TK:</span>
          <span className="font-black text-[#16823B]">{ratio}</span>
        </div>
      </div>
    </div>
  );
}
