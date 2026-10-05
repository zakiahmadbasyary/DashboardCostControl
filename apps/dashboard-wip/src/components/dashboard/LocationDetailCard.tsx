"use client";

import { LocationData } from "@/types/dashboard";
import {
  FileSpreadsheet,
  MapPin,
  Tag,
  Ruler,
  Sprout,
  Award,
  Clock,
} from "lucide-react";

interface LocationDetailCardProps {
  selectedLocation: LocationData | null;
}

export default function LocationDetailCard({
  selectedLocation,
}: LocationDetailCardProps) {
  if (!selectedLocation) {
    return (
      <div className="bg-white border border-dashed border-[#DDE5DF] rounded-2xl p-6 text-center shadow-xs">
        <p className="text-sm font-semibold text-[#5F6B63]">
          Pilih salah satu baris lokasi pada tabel <strong className="text-[#16823B]">Analisis Lokasi</strong> untuk melihat Rincian Detail Lokasi WIP.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Green Top Header Banner */}
      <div className="bg-[#16823B] p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-extrabold text-base sm:text-lg text-white">
                Detail Lokasi {selectedLocation.lokasi}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A8D437] text-[#17231B] font-extrabold text-xs shadow-2xs">
                Wilayah {selectedLocation.wilayah}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Rincian profil lokasi, atribut bibit, dan status blok dari database WIP
            </p>
          </div>
        </div>

        {/* Right side pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-xs font-semibold text-white shrink-0 self-start sm:self-center">
          <span>🌱</span>
          <span>
            Kelas: <strong>{selectedLocation.kelas || selectedLocation.kelasBibit || "-"}</strong>
          </span>
        </div>
      </div>

      {/* Detail Grid: 7 Cards (Lokasi, Wilayah, Status, Luas, Jenis Bibit, Kelas Bibit, Umur) */}
      <div className="p-4 bg-[#F7F9F7]/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Lokasi */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#16823B]" /> LOKASI
          </span>
          <span className="text-base font-extrabold text-[#17231B]">
            {selectedLocation.lokasi}
          </span>
        </div>

        {/* 2. Wilayah */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#16823B]" /> WILAYAH
          </span>
          <span className="text-base font-extrabold text-[#17231B]">
            {selectedLocation.wilayah}
          </span>
        </div>

        {/* 3. Status */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 block">
            STATUS
          </span>
          <span className="inline-self-start px-2 py-0.5 text-xs font-extrabold rounded-md bg-[#16823B]/10 text-[#16823B] border border-[#16823B]/20 w-fit">
            {selectedLocation.status || "-"}
          </span>
        </div>

        {/* 4. Luas (Ha) */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Ruler className="w-3 h-3 text-[#16823B]" /> LUAS (HA)
          </span>
          <span className="text-base font-extrabold text-[#17231B]">
            {selectedLocation.luas
              ? `${selectedLocation.luas.toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} Ha`
              : "0 Ha"}
          </span>
        </div>

        {/* 5. Jenis Bibit */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sprout className="w-3 h-3 text-[#16823B]" /> JENIS BIBIT
          </span>
          <span className="text-base font-bold text-[#16823B]">
            {selectedLocation.jenisBibit || "-"}
          </span>
        </div>

        {/* 6. Kelas Bibit */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-[#16823B]" /> KELAS BIBIT
          </span>
          <span className="text-base font-bold text-[#17231B]">
            {selectedLocation.kelas || selectedLocation.kelasBibit || "-"}
          </span>
        </div>

        {/* 7. Umur */}
        <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#16823B]" /> UMUR
          </span>
          <span className="text-base font-extrabold text-[#16823B]">
            {selectedLocation.umur !== undefined && selectedLocation.umur !== null
              ? `${selectedLocation.umur} Bulan`
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
