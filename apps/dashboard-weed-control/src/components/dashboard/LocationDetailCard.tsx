"use client";

import React from "react";
import { LocationDetail, LocationItem } from "@/types/dashboard";
import {
  FileSpreadsheet,
  MapPin,
  Tag,
  Ruler,
  Sprout,
  Award,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDecimal2 } from "@/lib/formatters";

interface LocationDetailCardProps {
  location: LocationDetail | LocationItem | null;
  loading?: boolean;
}

/**
 * Memetakan kode/nama jenis bibit ke label standar:
 * C / Crown -> Crown
 * S / Sucker -> Sucker
 * N / Nursery -> Nursery
 */
export function mapJenisBibit(val?: string | null): string {
  if (!val) return "-";
  const trimmed = val.trim().toLowerCase();
  if (trimmed === "c" || trimmed.startsWith("crown")) return "Crown";
  if (trimmed === "s" || trimmed.startsWith("sucker")) return "Sucker";
  if (trimmed === "n" || trimmed.startsWith("nurs")) return "Nursery";
  return val;
}

/**
 * Memetakan kode/nama kelas bibit ke label standar:
 * K / Kecil -> Kecil
 * S / Sedang -> Sedang
 * B / Besar -> Besar
 * M / Medium -> Sedang
 */
export function mapKelasBibit(val?: string | null): string {
  if (!val) return "-";
  const trimmed = val.trim().toLowerCase();
  if (trimmed === "k" || trimmed.startsWith("kecil")) return "Kecil";
  if (trimmed === "s" || trimmed.startsWith("sedang")) return "Sedang";
  if (trimmed === "b" || trimmed.startsWith("besar")) return "Besar";
  if (trimmed === "m" || trimmed.startsWith("med") || trimmed.startsWith("menengah")) return "Sedang";
  return val;
}

export default function LocationDetailCard({
  location,
  loading,
}: LocationDetailCardProps) {
  if (!location) {
    return (
      <div className="bg-white border border-dashed border-[#DDE5DF] rounded-2xl p-6 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-[#F7F9F7] text-[#89938D] border border-[#DDE5DF]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#5F6B63]">
            Pilih salah satu baris lokasi pada tabel{" "}
            <strong className="text-[#16823B]">List Lokasi</strong> di atas untuk melihat Rincian Detail Lokasi.
          </p>
        </div>
      </div>
    );
  }

  const jenisLabel = mapJenisBibit(location.jenis);
  const kelasLabel = mapKelasBibit(location.kelas);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
      {/* 1. Top Banner Header (Hijau) */}
      <div className="bg-[#16823B] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-white">
                Detail Profil Lokasi {location.lokasi}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 font-normal mt-0.5 hidden sm:block">
              Rincian profil master kebun, atribut bibit, dan umur tanaman dari database Weed Control
            </p>
          </div>
        </div>

        {/* Right side info pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-xs font-medium text-white shrink-0 self-start sm:self-center">
          <span>🌱</span>
          <span>
            Kelas: <strong className="font-semibold">{kelasLabel}</strong>
          </span>
        </div>
      </div>

      {/* 2. 7 Core Detail Tiles Grid (Berdampingan Langsung Sampingnya & Ketebalan Ringan) */}
      <div className="p-2.5 sm:p-3 bg-[#F7F9F7]/60 border-t border-[#DDE5DF]">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 lg:divide-x divide-[#DDE5DF] gap-y-2 lg:gap-y-0 items-center">
          {/* 1. Lokasi */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#16823B]" /> Lokasi :
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-[#16823B]">
              {location.lokasi}
            </span>
          </div>

          {/* 2. Status */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium">
              Status :
            </span>
            <span className="px-1.5 py-0.5 text-[11px] font-medium rounded bg-[#16823B]/10 text-[#16823B] border border-[#16823B]/20">
              {location.status || "-"}
            </span>
          </div>

          {/* 3. Wilayah */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#16823B]" /> Wilayah :
            </span>
            <span className="text-xs sm:text-[13px] font-medium text-[#17231B]">
              {location.wilayah}
            </span>
          </div>

          {/* 4. Luas */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#16823B]" /> Luas :
            </span>
            <span className="text-xs sm:text-[13px] font-medium text-[#17231B]">
              {formatDecimal2(location.luas)} Ha
            </span>
          </div>

          {/* 5. Jenis */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <Sprout className="w-3 h-3 text-[#16823B]" /> Jenis :
            </span>
            <span
              className="text-xs sm:text-[13px] font-medium text-[#17231B] truncate max-w-[100px]"
              title={jenisLabel}
            >
              {jenisLabel}
            </span>
          </div>

          {/* 6. Kelas */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <Award className="w-3 h-3 text-[#16823B]" /> Kelas :
            </span>
            <span className="text-xs sm:text-[13px] font-medium text-[#17231B]">
              {kelasLabel}
            </span>
          </div>

          {/* 7. Umur */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
            <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#16823B]" /> Umur :
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-[#16823B]">
              {location.umur !== null && location.umur !== undefined
                ? `${location.umur} Bulan`
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
