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
  Calendar,
  Layers,
  AlertCircle,
} from "lucide-react";
import { formatCurrencyRp, formatDecimal2, formatDateShort } from "@/lib/formatters";

interface LocationDetailCardProps {
  location: LocationDetail | LocationItem | null;
  loading?: boolean;
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

  // Type guard / cast for extended details
  const detail = location as LocationDetail;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-[#16823B] p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-extrabold text-base sm:text-lg text-white">
                Detail Profil Lokasi {location.lokasi}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A8D437] text-[#17231B] font-extrabold text-xs shadow-2xs">
                Wilayah {location.wilayah}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs border border-white/30">
                Status: {location.status}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Rincian profil master kebun, atribut bibit, dan umur tanaman dari database Weed Control
            </p>
          </div>
        </div>

        {/* Right side info pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-xs font-semibold text-white shrink-0 self-start sm:self-center">
          <span>🌱</span>
          <span>
            Kelas: <strong>{location.kelas || "-"}</strong>
          </span>
        </div>
      </div>

      {/* 7 Core Detail Tiles Grid */}
      <div className="p-4 bg-[#F7F9F7]/50 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Lokasi */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#16823B]" /> LOKASI
          </span>
          <span className="text-base font-extrabold text-[#17231B]">{location.lokasi}</span>
        </div>

        {/* 2. Status */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 block">
            STATUS
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-extrabold rounded-md bg-[#16823B]/10 text-[#16823B] border border-[#16823B]/20 w-fit">
            {location.status || "-"}
          </span>
        </div>

        {/* 3. Wilayah */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#16823B]" /> WILAYAH
          </span>
          <span className="text-base font-extrabold text-[#17231B]">{location.wilayah}</span>
        </div>

        {/* 4. Luas (Ha) */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Ruler className="w-3 h-3 text-[#16823B]" /> LUAS (HA)
          </span>
          <span className="text-base font-extrabold text-[#17231B]">
            {formatDecimal2(location.luas)}
          </span>
        </div>

        {/* 5. Jenis Bibit */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sprout className="w-3 h-3 text-[#16823B]" /> JENIS
          </span>
          <span className="text-sm font-extrabold text-[#17231B] truncate" title={location.jenis}>
            {location.jenis || "-"}
          </span>
        </div>

        {/* 6. Kelas Bibit */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-[#16823B]" /> KELAS
          </span>
          <span className="text-sm font-extrabold text-[#17231B]">{location.kelas || "-"}</span>
        </div>

        {/* 7. Umur Saat Ini */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#16823B]" /> UMUR
          </span>
          <span className="text-base font-extrabold text-[#16823B]">
            {location.umur !== null && location.umur !== undefined ? `${location.umur} Bulan` : "-"}
          </span>
        </div>
      </div>

      {/* Optional Metadata Row (Mulai Rawat, Tanam, Forcing, Panen) if available */}
      {detail.mulaiRawat && (
        <div className="px-4 py-2.5 bg-white border-t border-[#DDE5DF] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5F6B63]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Mulai Rawat: <strong>{formatDateShort(detail.mulaiRawat)}</strong></span>
          </div>
          {detail.mulaiTanam && (
            <div className="flex items-center gap-1.5">
              <span>Mulai Tanam: <strong>{formatDateShort(detail.mulaiTanam)}</strong></span>
            </div>
          )}
          {detail.realForcing && (
            <div className="flex items-center gap-1.5">
              <span>Real Forcing: <strong>{formatDateShort(detail.realForcing)}</strong></span>
            </div>
          )}
          {detail.selesaiPanen && (
            <div className="flex items-center gap-1.5">
              <span>Selesai Panen: <strong>{formatDateShort(detail.selesaiPanen)}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

