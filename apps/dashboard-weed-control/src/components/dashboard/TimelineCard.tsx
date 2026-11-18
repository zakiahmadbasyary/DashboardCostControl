"use client";

import React, { useState, useEffect } from "react";
import { TimelineItem, LocationItem } from "@/types/dashboard";
import { weedDashboardService, MaterialDetailResponse } from "@/services/weedDashboardService";
import {
  Clock,
  Search,
  AlertCircle,
  FlaskConical,
  X,
} from "lucide-react";
import {
  formatCurrencyRp,
  formatDecimal2,
  formatDateShort,
} from "@/lib/formatters";

interface TimelineCardProps {
  selectedLocation: LocationItem | null;
  timeline: TimelineItem[];
  loading?: boolean;
  selectedActivity?: string | null;
  onResetActivityFilter?: () => void;
}

type AreaBasis = "lokasi" | "hasil";

export default function TimelineCard({
  selectedLocation,
  timeline,
  loading,
  selectedActivity,
  onResetActivityFilter,
}: TimelineCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaBasis, setAreaBasis] = useState<AreaBasis>("lokasi");

  // State untuk panel Detail Material (sebelah kanan 35%)
  const [selectedMaterialItem, setSelectedMaterialItem] = useState<TimelineItem | null>(null);
  const [materialData, setMaterialData] = useState<MaterialDetailResponse | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Reset search & detail material saat lokasi berubah
  useEffect(() => {
    setSearchQuery("");
    setSelectedMaterialItem(null);
    setMaterialData(null);
    setMaterialError(null);
  }, [selectedLocation]);

  // Reset detail material saat filter aktivitas atau daftar timeline berubah
  useEffect(() => {
    setSelectedMaterialItem(null);
    setMaterialData(null);
    setMaterialError(null);
  }, [selectedActivity, timeline]);

  // Fetch data material saat baris timeline dipilih
  useEffect(() => {
    if (!selectedMaterialItem) {
      setMaterialData(null);
      setMaterialError(null);
      setLoadingMaterials(false);
      return;
    }

    if (!selectedMaterialItem.hasMaterials) {
      setMaterialData({ timeline: null, materials: [], total: 0 });
      setMaterialError(null);
      setLoadingMaterials(false);
      return;
    }

    let isMounted = true;
    setLoadingMaterials(true);
    setMaterialError(null);

    weedDashboardService
      .getMaterials(selectedMaterialItem.id)
      .then((res) => {
        if (isMounted) {
          setMaterialData(res);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setMaterialError(err.message || "Gagal memuat rincian bahan material");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingMaterials(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMaterialItem]);

  // Sort timeline by date ascending (terkecil ke terbesar / tanggal terlama ke terbaru)
  const sortedTimeline = React.useMemo(() => {
    return [...timeline].sort((a, b) => {
      if (!a.tanggalRealisasi && !b.tanggalRealisasi) return 0;
      if (!a.tanggalRealisasi) return 1;
      if (!b.tanggalRealisasi) return -1;
      const dateA = new Date(a.tanggalRealisasi).getTime();
      const dateB = new Date(b.tanggalRealisasi).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return Number(a.id) - Number(b.id);
    });
  }, [timeline]);

  // Client-side search & activity filtering
  const filteredTimeline = React.useMemo(() => {
    let result = sortedTimeline;
    if (selectedActivity) {
      result = result.filter(
        (item) => item.aktivitas.toLowerCase() === selectedActivity.toLowerCase()
      );
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter((item) => {
      return (
        item.aktivitas.toLowerCase().includes(q) ||
        (item.uom && item.uom.toLowerCase().includes(q)) ||
        (item.tanggalRealisasi && item.tanggalRealisasi.toLowerCase().includes(q))
      );
    });
  }, [sortedTimeline, selectedActivity, searchQuery]);

  // Filter hanya material yang memiliki nilai (> 0, bukan 0, bukan null, bukan "-")
  const validMaterials = React.useMemo(() => {
    return (materialData?.materials || []).filter((mat) => {
      if (mat.quantity === null || mat.quantity === undefined) return false;
      const val = typeof mat.quantity === "number" ? mat.quantity : parseFloat(String(mat.quantity));
      return !isNaN(val) && val > 0;
    });
  }, [materialData]);

  if (!selectedLocation) {
    return (
      <div className="bg-white border border-dashed border-[#DDE5DF] rounded-2xl p-6 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-[#F7F9F7] text-[#89938D] border border-[#DDE5DF]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#5F6B63]">
            Pilih salah satu baris lokasi pada tabel{" "}
            <strong className="text-[#16823B]">List Lokasi</strong> untuk melihat riwayat aktivitas dan aplikasi material.
          </p>
        </div>
      </div>
    );
  }

  const getDivisor = (item: TimelineItem): number | null => {
    if (areaBasis === "lokasi") {
      return selectedLocation.luas > 0 ? selectedLocation.luas : null;
    }
    return item.hasil !== null && item.hasil !== undefined && item.hasil > 0 ? item.hasil : null;
  };

  const calcCostPerArea = (
    value: number | null | undefined,
    divisor: number | null
  ): number | null => {
    if (value === null || value === undefined || divisor === null || divisor <= 0) {
      return null;
    }
    return value / divisor;
  };

  const buildCostTooltip = (
    rawVal: number | null | undefined,
    divisor: number | null
  ): string | undefined => {
    if (rawVal === null || rawVal === undefined || rawVal === 0) return undefined;
    const basisLabel =
      areaBasis === "lokasi"
        ? `Luas Lokasi (${formatDecimal2(selectedLocation.luas)} Ha)`
        : `Luas Hasil (${divisor ? formatDecimal2(divisor) : "0"})`;
    return `Biaya asli: ${formatCurrencyRp(rawVal)} ÷ ${basisLabel}`;
  };

  const formatDosis2 = (val: number | null): string => {
    if (val === null || isNaN(val)) return "-";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const selectedMaterialDivisor = selectedMaterialItem ? getDivisor(selectedMaterialItem) : null;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base md:text-md text-[#17231B]">
                Timeline Aktivitas & Aplikasi Lapangan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#CBE0D1]">
                Lokasi: {selectedLocation.lokasi}
              </span>
              {selectedActivity && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16823B] text-white font-semibold text-xs shadow-xs">
                  <span>Aktivitas: {selectedActivity}</span>
                  {onResetActivityFilter && (
                    <button
                      type="button"
                      onClick={onResetActivityFilter}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Tampilkan semua aktivitas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Riwayat lengkap aplikasi lapangan, tenaga kerja, upah, charge, dan pemakaian bahan material
            </p>
          </div>
        </div>

        {/* Filter Luas & Search Input Box */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Segmented Toggle: Luas Lokasi vs Luas Hasil */}
          <div
            className="inline-flex items-center bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg p-0.5"
            role="group"
            aria-label="Filter basis pembagi luas"
          >
            <button
              type="button"
              onClick={() => setAreaBasis("lokasi")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                areaBasis === "lokasi"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#5F6B63] hover:text-[#17231B]"
              }`}
              title={`Bagi biaya & dosis dengan Luas Lokasi (${formatDecimal2(selectedLocation.luas)} Ha)`}
            >
              Luas Lokasi
            </button>
            <button
              type="button"
              onClick={() => setAreaBasis("hasil")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                areaBasis === "hasil"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#5F6B63] hover:text-[#17231B]"
              }`}
              title="Bagi biaya & dosis dengan Luas Hasil pada masing-masing baris transaksi"
            >
              Luas Hasil
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] w-48 sm:w-56 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content Split: 65% Left (Timeline Table) + 35% Right (Detail Material Table) */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat riwayat timeline...</p>
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="py-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-xs text-[#5F6B63]">
            {selectedActivity
              ? `Tidak ada transaksi timeline untuk aktivitas "${selectedActivity}".`
              : searchQuery
              ? "Tidak ada transaksi yang cocok dengan pencarian."
              : "Belum ada riwayat aktivitas untuk lokasi ini."}
          </p>
          {selectedActivity && onResetActivityFilter && (
            <button
              type="button"
              onClick={onResetActivityFilter}
              className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16823B] text-white hover:bg-[#126930] transition-colors cursor-pointer"
            >
              <span>Tampilkan Semua Aktivitas</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* ================= BAGIAN KIRI: 65% (Tabel Timeline - Tanpa Scroll Samping di Desktop) ================= */}
          <div className="w-full lg:w-[65%] min-w-0 flex flex-col justify-between gap-2.5">
            <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] max-h-[360px] overflow-y-auto">
              <table className="w-full min-w-[640px] lg:min-w-0 text-[10px] xl:text-[10.5px] 2xl:text-[11px] text-left border-collapse">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[9px] xl:text-[9.5px] 2xl:text-[10px] leading-tight font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2 px-1.5 xl:px-2">Aktivitas</th>
                    <th className="py-2 px-1 xl:px-1.5 whitespace-normal">Tgl Realisasi</th>
                    <th className="py-2 px-1 xl:px-1.5 text-center">Umur</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right">Hasil</th>
                    <th className="py-2 px-1 xl:px-1.5 text-center">UoM</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right">TK</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right whitespace-normal">Kapasitas/TK</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right whitespace-normal">Total Cost</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right">Upah</th>
                    <th className="py-2 px-1 xl:px-1.5 text-right">Charge</th>
                    <th className="py-2 px-1.5 xl:px-2 text-right">Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60 leading-snug">
                  {filteredTimeline.map((item) => {
                    const divisor = getDivisor(item);
                    const totalCostPerArea = calcCostPerArea(item.totalCost, divisor);
                    const upahPerArea = calcCostPerArea(item.upah, divisor);
                    const chargePerArea = calcCostPerArea(item.charge, divisor);
                    const materialPerArea = calcCostPerArea(item.material, divisor);
                    const isMaterialSelected = selectedMaterialItem?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedMaterialItem(item)}
                        title="Klik baris untuk melihat detail dosis material"
                        className={`transition-colors cursor-pointer group ${
                          isMaterialSelected
                            ? "bg-[#EAF3EC] border-l-4 border-[#16823B]"
                            : "hover:bg-[#F7F9F7]"
                        }`}
                      >
                        <td className="py-2 px-1.5 xl:px-2 font-semibold text-[#17231B] whitespace-normal break-words max-w-[125px] xl:max-w-[165px]">
                          <div className="flex items-center gap-1.5">
                            {isMaterialSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16823B] shrink-0 animate-pulse" />
                            )}
                            <span
                              className={
                                isMaterialSelected
                                  ? "text-[#16823B] font-bold"
                                  : "group-hover:text-[#16823B] transition-colors"
                              }
                            >
                              {item.aktivitas}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-1 xl:px-1.5 text-[#5F6B63] tabular-nums whitespace-nowrap">
                          {formatDateShort(item.tanggalRealisasi)}
                        </td>
                        <td className="py-2 px-1 xl:px-1.5 text-center tabular-nums font-medium whitespace-nowrap">
                          {item.umur !== null && item.umur !== undefined ? `${item.umur} Bln` : "-"}
                        </td>
                        {/* Hasil */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums text-[#17231B] whitespace-nowrap"
                          title={item.hasil !== null ? `Nilai asli: ${item.hasil}` : undefined}
                        >
                          {formatDecimal2(item.hasil)}
                        </td>
                        <td className="py-2 px-1 xl:px-1.5 text-center text-[#5F6B63] whitespace-nowrap">
                          {item.uom || "-"}
                        </td>
                        {/* TK */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums text-[#17231B] whitespace-nowrap"
                          title={item.tk !== null ? `Nilai asli: ${item.tk}` : undefined}
                        >
                          {formatDecimal2(item.tk)}
                        </td>
                        {/* Kapasitas/TK */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums text-[#17231B] whitespace-nowrap"
                          title={
                            item.kapasitasPerTk !== null
                              ? `Nilai asli: ${item.kapasitasPerTk}`
                              : undefined
                          }
                        >
                          {formatDecimal2(item.kapasitasPerTk)}
                        </td>
                        {/* Total Cost */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums font-bold text-[#17231B] whitespace-nowrap"
                          title={buildCostTooltip(item.totalCost, divisor)}
                        >
                          {formatCurrencyRp(totalCostPerArea)}
                        </td>
                        {/* Upah */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums text-[#5F6B63] whitespace-nowrap"
                          title={buildCostTooltip(item.upah, divisor)}
                        >
                          {formatCurrencyRp(upahPerArea)}
                        </td>
                        {/* Charge */}
                        <td
                          className="py-2 px-1 xl:px-1.5 text-right tabular-nums text-[#5F6B63] whitespace-nowrap"
                          title={buildCostTooltip(item.charge, divisor)}
                        >
                          {formatCurrencyRp(chargePerArea)}
                        </td>
                        {/* Material */}
                        <td
                          className="py-2 px-1.5 xl:px-2 text-right tabular-nums whitespace-nowrap"
                          title={buildCostTooltip(item.material, divisor)}
                        >
                          {item.hasMaterials && typeof item.material === "number" && item.material > 0 ? (
                            <span
                              className={`inline-flex items-center gap-0.5 xl:gap-1 px-1.5 py-0.5 rounded-md font-bold transition-all ${
                                isMaterialSelected
                                  ? "bg-[#16823B] text-white shadow-xs"
                                  : "bg-[#16823B]/10 group-hover:bg-[#16823B] text-[#16823B] group-hover:text-white"
                              }`}
                            >
                              <FlaskConical
                                className={`w-2.5 h-2.5 xl:w-3 xl:h-3 shrink-0 ${
                                  isMaterialSelected
                                    ? "text-white"
                                    : "text-[#16823B] group-hover:text-white"
                                }`}
                              />
                              <span>{formatCurrencyRp(materialPerArea)}</span>
                            </span>
                          ) : (
                            <span className="text-[#5F6B63]">{formatCurrencyRp(materialPerArea)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Summary Footer */}
            <div className="flex items-center justify-between text-xs text-[#5F6B63] pt-1 border-t border-[#DDE5DF]/80">
              <span>
                Menampilkan <strong className="text-[#16823B] font-bold">{filteredTimeline.length}</strong> transaksi
              </span>
              {filteredTimeline.length > 8 && (
                <span className="text-[11px] text-[#89938D]">
                  * Scroll ke bawah pada tabel untuk melihat data lainnya
                </span>
              )}
            </div>
          </div>

          {/* ================= BAGIAN KANAN: 35% (Tabel Detail Material) ================= */}
          <div className="w-full lg:w-[35%] flex-1 min-w-0 bg-[#F7F9F7]/70 border border-[#DDE5DF] rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              {/* Header Panel Detail Material */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#DDE5DF]/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#17231B] leading-tight">
                      Detail Material
                    </h4>
                    {selectedMaterialItem ? (
                      <p className="text-[11px] text-[#5F6B63] truncate mt-0.5">
                        <strong className="text-[#16823B]">{selectedMaterialItem.aktivitas}</strong> •{" "}
                        {formatDateShort(selectedMaterialItem.tanggalRealisasi)}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#89938D] mt-0.5">
                        Rincian nama material & dosis aplikasi
                      </p>
                    )}
                  </div>
                </div>

                {selectedMaterialItem && (
                  <button
                    type="button"
                    onClick={() => setSelectedMaterialItem(null)}
                    className="p-1 rounded-lg text-[#5F6B63] hover:text-[#17231B] hover:bg-[#DDE5DF]/50 transition-colors cursor-pointer shrink-0"
                    title="Tutup detail material"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Body Panel Detail Material */}
              {!selectedMaterialItem ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-[#DDE5DF] min-h-[220px]">
                  <div className="p-2.5 rounded-full bg-[#EAF3EC] text-[#16823B] mb-2.5">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-[#5F6B63] max-w-[240px] leading-relaxed">
                    Klik salah satu baris transaksi di tabel kiri untuk melihat detail dosis material
                  </p>
                </div>
              ) : loadingMaterials ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-[#DDE5DF] min-h-[220px]">
                  <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs font-semibold text-[#5F6B63]">
                    Memuat detail material...
                  </p>
                </div>
              ) : materialError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-rose-50 rounded-xl border border-rose-200 min-h-[220px]">
                  <AlertCircle className="w-5 h-5 text-rose-600 mb-1.5" />
                  <p className="text-xs font-bold text-rose-700">{materialError}</p>
                </div>
              ) : validMaterials.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-dashed border-[#DDE5DF] min-h-[220px]">
                  <p className="text-xs text-[#5F6B63]">
                    Tidak ada data bahan material dengan nilai tercatat untuk transaksi ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] bg-white max-h-[275px] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                      <tr>
                        <th className="py-2.5 px-3">Nama Material</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Dosis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE5DF]/60">
                      {validMaterials.map((mat) => {
                        const dosis =
                          selectedMaterialDivisor !== null && selectedMaterialDivisor > 0
                            ? mat.quantity / selectedMaterialDivisor
                            : null;
                        const basisLabel =
                          areaBasis === "lokasi"
                            ? `Luas Lokasi (${formatDecimal2(selectedLocation.luas)} Ha)`
                            : `Luas Hasil (${
                                selectedMaterialDivisor ? formatDecimal2(selectedMaterialDivisor) : "0"
                              })`;

                        return (
                          <tr key={mat.id} className="hover:bg-[#F7F9F7] transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-[#17231B]">
                              {mat.namaMaterial}
                            </td>
                            <td
                              className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap"
                              title={`Quantity asli: ${mat.quantity} ÷ ${basisLabel}`}
                            >
                              {formatDosis2(dosis)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Panel Detail Material */}
            <div className="flex items-center justify-between text-[11px] text-[#5F6B63] pt-1 border-t border-[#DDE5DF]/80">
              <span>
                {selectedMaterialItem && !loadingMaterials && !materialError ? (
                  <>
                    <strong className="text-[#16823B] font-bold">{validMaterials.length}</strong>{" "}
                    material
                  </>
                ) : (
                  "Detail Material"
                )}
              </span>
              <span className="text-[10px] text-[#89938D]">
                Basis:{" "}
                <strong className="text-[#5F6B63]">
                  {areaBasis === "lokasi"
                    ? `Luas Lokasi (${formatDecimal2(selectedLocation.luas)} Ha)`
                    : selectedMaterialItem
                    ? `Luas Hasil (${formatDecimal2(selectedMaterialItem.hasil)})`
                    : "Luas Hasil"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
