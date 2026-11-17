"use client";

import React, { useState, useEffect, useRef } from "react";
import { LocationItem } from "@/types/dashboard";
import { MapPin, ChevronDown, Filter } from "lucide-react";
import { formatCurrencyRp } from "@/lib/formatters";

interface LocationListCardProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (location: LocationItem) => void;
  umurList: number[];
  wilayahList?: string[];
  selectedUmur: number[] | "all";
  selectedWilayah?: string[] | "all";
  onFilterChange: (filters: {
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }) => void;
  loading?: boolean;
}

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green
  AW02: "#29A9D6", // Blue
  AW03: "#FCE27A", // Secondary Yellow
  AW04: "#A8D437", // Light Green
  AW05: "#0B6B32", // Dark Green
  AW06: "#053916", // Deep Forest Green
  AW07: "#89938D", // Gray
};

export default function LocationListCard({
  locations,
  selectedLocation,
  onSelectLocation,
  umurList,
  selectedUmur,
  onFilterChange,
  loading,
}: LocationListCardProps) {
  const [isUmurOpen, setIsUmurOpen] = useState(false);
  const umurRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (umurRef.current && !umurRef.current.contains(e.target as Node)) {
        setIsUmurOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUmur = (u: number) => {
    setIsUmurOpen(false);
    onFilterChange({
      umur: [u],
      wilayah: "all",
      search: "",
    });
  };

  // Nilai umur aktif (default 1 jika tidak ditentukan)
  const currentUmur =
    Array.isArray(selectedUmur) && selectedUmur.length > 0
      ? selectedUmur[0]
      : typeof selectedUmur === "number"
      ? selectedUmur
      : 1;

  const umurLabel = `${currentUmur} Bulan`;

  // Group locations by Wilayah, diurutkan dari cost/ha terbesar ke terkecil (Descending)
  const locationsByRegion = React.useMemo(() => {
    const map: Record<string, LocationItem[]> = {};
    for (const reg of REGIONS) {
      map[reg] = [];
    }
    for (const loc of locations) {
      if (map[loc.wilayah]) {
        map[loc.wilayah].push(loc);
      } else {
        map[loc.wilayah] = [loc];
      }
    }
    // Urutkan setiap tabel wilayah dari cost/ha terbesar ke terkecil
    for (const reg of REGIONS) {
      map[reg].sort((a, b) => {
        const diff = (b.costHa ?? 0) - (a.costHa ?? 0);
        if (diff !== 0) return diff;
        return a.lokasi.localeCompare(b.lokasi);
      });
    }
    return map;
  }, [locations]);

  return (
    <div
      id="location-analysis-section"
      className="relative z-0 isolate bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs scroll-mt-36 sm:scroll-mt-44 lg:scroll-mt-[175px] flex flex-col gap-3.5"
    >
      {/* Header Bar matching WIP Analisis Lokasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]/70">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#17231B]">
              Analisis Lokasi per Wilayah
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Pilih salah satu baris lokasi untuk melihat rincian detail, aktivitas, dan riwayat timeline.{" "}
              <span className="font-semibold text-[#16823B]">
                * Seluruh nilai biaya disajikan dalam Rupiah (Rp)
              </span>
            </p>
          </div>
        </div>

        {/* Filter Umur (Tanpa Semua Umur, Default Umur 1) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="relative" ref={umurRef}>
            <button
              onClick={() => setIsUmurOpen(!isUmurOpen)}
              suppressHydrationWarning
              className="bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#17231B] flex items-center gap-1.5 transition-colors cursor-pointer h-[29px]"
            >
              <Filter className="w-3.5 h-3.5 text-[#16823B]" />
              <span>
                Umur: <strong>{umurLabel}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6B63]" />
            </button>

            {isUmurOpen && (
              <div className="absolute right-0 mt-1 z-30 w-44 bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-[#89938D] uppercase tracking-wider border-b border-[#DDE5DF]/70 mb-0.5">
                  Pilih Umur Tanaman
                </div>
                <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                  {umurList.map((u) => {
                    const isSelected = currentUmur === u;
                    return (
                      <button
                        key={u}
                        onClick={() => handleSelectUmur(u)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#16823B] text-white"
                            : "text-[#17231B] hover:bg-[#F7F9F7]"
                        }`}
                      >
                        {u} Bulan
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7 Wilayah Tables - Compact, lighter fonts, fits in 1 row without scroll on desktop */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat data lokasi per wilayah...</p>
        </div>
      ) : (
        <div className="overflow-x-auto lg:overflow-x-visible pb-1 -mx-1 px-1">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 min-w-[700px] lg:min-w-0 w-full">
            {REGIONS.map((region) => {
              const regLocs = locationsByRegion[region] || [];
              const regColor = REGION_COLORS[region] || "#16823B";

              return (
                <div
                  key={region}
                  className="bg-white border border-[#DDE5DF] rounded-xl overflow-hidden shadow-2xs flex flex-col min-w-0"
                >
                  {/* Wilayah Mini Card Header Banner */}
                  <div className="bg-[#F7F9F7] border-b border-[#DDE5DF] px-2 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: regColor }}
                      />
                      <span className="font-semibold text-[11px] text-[#17231B] truncate">
                        Wilayah {region}
                      </span>
                    </div>
                    <span className="text-[9px] font-medium text-[#5F6B63] bg-white px-1 py-0.5 rounded border border-[#DDE5DF] shrink-0">
                      {regLocs.length}
                    </span>
                  </div>

                  {/* Table with max 5 rows visible, scrollable if > 5 */}
                  <div className="max-h-[168px] overflow-y-auto">
                    {regLocs.length === 0 ? (
                      <div className="py-6 px-1 text-center text-[10px] text-[#89938D]">
                        Tidak ada data
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F7F9F7] text-[#5F6B63] uppercase text-[9px] font-semibold border-b border-[#DDE5DF] sticky top-0 z-[1] shadow-2xs">
                          <tr>
                            <th className="py-1 px-1.5">Lokasi</th>
                            <th className="py-1 px-1.5 text-right">Cost / Ha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDE5DF]/60">
                          {regLocs.map((item) => {
                            const isSelected = selectedLocation?.lokasi === item.lokasi;
                            return (
                              <tr
                                key={item.lokasi}
                                onClick={() => onSelectLocation(item)}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-[#A8D437]/20 border-l-2 border-[#16823B] font-medium text-[#0B6B32]"
                                    : "hover:bg-[#F7F9F7] text-[#17231B]"
                                }`}
                              >
                                <td className="py-1.5 px-1.5 font-medium text-[10.5px] whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-[#16823B] shrink-0" />
                                    <span className="truncate">{item.lokasi}</span>
                                  </div>
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-mono text-[9.5px] font-normal text-[#16823B] whitespace-nowrap">
                                  {formatCurrencyRp(item.costHa)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
