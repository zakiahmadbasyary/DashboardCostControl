"use client";

import { LocationData, LocationFilter } from "@/types/dashboard";
import { MapPin, CheckCircle2 } from "lucide-react";

interface LocationAnalysisProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  locationFilters: LocationFilter;
  onFilterChange: (filters: LocationFilter) => void;
  onSelectLocation: (location: LocationData) => void;
  loading?: boolean;
}

export default function LocationAnalysis({
  locations,
  selectedLocation,
  locationFilters,
  onFilterChange,
  onSelectLocation,
  loading,
}: LocationAnalysisProps) {
  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Analisis Lokasi</h3>
            <p className="text-xs text-[#5F6B63]">Pilih salah satu baris lokasi untuk melihat rincian Group Cost</p>
          </div>
        </div>

        {/* Location Specific Sub-Filters */}
        <div className="flex items-center gap-2">
          <select
            value={locationFilters.umur}
            onChange={(e) =>
              onFilterChange({
                ...locationFilters,
                umur: Number(e.target.value),
              })
            }
            className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#17231B] focus:outline-none focus:border-[#16823B]"
          >
            {Array.from({ length: 22 }, (_, i) => (
              <option key={i} value={i}>
                Umur {i} Bulan
              </option>
            ))}
          </select>

          <select
            value={locationFilters.wilayah}
            onChange={(e) =>
              onFilterChange({
                ...locationFilters,
                wilayah: e.target.value,
              })
            }
            className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#17231B] focus:outline-none focus:border-[#16823B]"
          >
            <option value="AW01">AW01</option>
            <option value="AW02">AW02</option>
            <option value="AW03">AW03</option>
            <option value="AW04">AW04</option>
            <option value="AW05">AW05</option>
            <option value="AW06">AW06</option>
            <option value="AW07">AW07</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat data lokasi...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-sm font-semibold text-[#5F6B63]">Tidak ada hasil filter lokasi</p>
          <p className="text-xs text-[#89938D] mt-1">Coba sesuaikan filter utama atau filter umur/wilayah di atas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4">Umur</th>
                <th className="py-3 px-4 text-right">Cost / Ha</th>
                <th className="py-3 px-4 text-right">Luas (Ha)</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4">Jenis Bibit</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Status Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60">
              {locations.map((item) => {
                const isSelected = selectedLocation?.idLokasi === item.idLokasi;
                return (
                  <tr
                    key={item.idLokasi}
                    onClick={() => onSelectLocation(item)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-medium text-[#0B6B32]"
                        : "hover:bg-[#F7F9F7] text-[#17231B]"
                    }`}
                  >
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16823B]" />
                      {item.lokasi}
                    </td>
                    <td className="py-3 px-4">{item.wilayah}</td>
                    <td className="py-3 px-4">{item.umur} Bln</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      Rp {item.costHa.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{item.luas}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#16823B] font-bold">
                      Rp {item.cost.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">{item.jenisBibit}</td>
                    <td className="py-3 px-4">{item.kelas}</td>
                    <td className="py-3 px-4 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#89938D]">Klik pilih</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
