"use client";

import { useState } from "react";
import { HistoryActivityData, KelengkapanData, LocationData, GroupCostData } from "@/types/dashboard";
import { FileText, Calendar, Layers, Wrench, Package, Users, AlertCircle } from "lucide-react";

interface ActivityDetailCardProps {
  selectedLocation: LocationData | null;
  selectedGroupCost: GroupCostData | null;
  historyActivities: HistoryActivityData[];
  loadingHistory?: boolean;
  selectedHistory: HistoryActivityData | null;
  onSelectHistory: (item: HistoryActivityData) => void;
  kelengkapan: KelengkapanData[];
  loadingKelengkapan?: boolean;
}

export default function ActivityDetailCard({
  selectedLocation,
  selectedGroupCost,
  historyActivities,
  loadingHistory,
  selectedHistory,
  onSelectHistory,
  kelengkapan,
  loadingKelengkapan,
}: ActivityDetailCardProps) {
  const [useLuas, setUseLuas] = useState<"lokasi" | "hasil">("lokasi");

  // Format Excel serial date
  const formatExcelDate = (serial: number) => {
    if (!serial || serial <= 0) return "-";
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    if (isNaN(date.getTime())) return String(serial);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const luasLokasi = selectedLocation?.luas || 0;

  // Luas hasil from selected history
  const luasHasil = selectedHistory
    ? selectedHistory.hasilCharge > 0
      ? selectedHistory.hasilCharge
      : selectedHistory.hasilUpah > 0
      ? selectedHistory.hasilUpah
      : selectedHistory.hasilTotal > 0
      ? selectedHistory.hasilTotal
      : 0
    : 0;

  // Active divisor for calculations
  const activeLuas = useLuas === "lokasi" ? luasLokasi : luasHasil;
  const isZeroLuas = !activeLuas || activeLuas <= 0;

  // Helper for division by activeLuas with zero fallback to "-"
  const calcPerHa = (val: number, isCurrency = true, decimals = 2): string => {
    if (isZeroLuas || !val || val <= 0) return "-";
    const res = val / activeLuas;
    return isCurrency
      ? Math.round(res).toLocaleString("id-ID")
      : res.toLocaleString("id-ID", { maximumFractionDigits: decimals });
  };

  if (!selectedLocation) {
    return null;
  }

  if (!selectedGroupCost) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center min-h-[180px]">
        <div className="p-2.5 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-2">
          <Layers className="w-5 h-5 text-[#16823B]" />
        </div>
        <h4 className="font-bold text-xs text-[#17231B]">Pilih Group Cost untuk Melihat Detail Aktivitas</h4>
        <p className="text-[11px] text-[#5F6B63] mt-0.5 max-w-sm">
          Klik salah satu baris Group Cost pada tabel di atas untuk memuat rincian jurnal riwayat aktivitas dan komponen kelengkapan biaya.
        </p>
      </div>
    );
  }

  // Filter Kelengkapan items
  const tkItems = kelengkapan.filter((k) => k.group.toLowerCase().trim() === "upah");
  const totalTkResource = tkItems.reduce((acc, curr) => acc + (curr.sumResource || 0), 0);
  const totalTkBiaya = tkItems.reduce((acc, curr) => acc + (curr.sumBiaya || 0), 0);

  // Group Unit items (Group = Charge) by kodeBahan
  const unitMap = new Map<string, { kodeBahan: string; sumBiaya: number }>();
  for (const item of kelengkapan) {
    if (item.group.toLowerCase().trim() === "charge") {
      const code = item.kodeBahan || "-";
      const existing = unitMap.get(code);
      if (existing) {
        existing.sumBiaya += item.sumBiaya || 0;
      } else {
        unitMap.set(code, { kodeBahan: code, sumBiaya: item.sumBiaya || 0 });
      }
    }
  }
  const unitItems = Array.from(unitMap.values());

  // Group Material items (Group = Material) by deskripsiBahan / kodeBahan
  const materialMap = new Map<string, { material: string; sumResource: number; sumBiaya: number }>();
  for (const item of kelengkapan) {
    if (item.group.toLowerCase().trim() === "material") {
      const name = item.deskripsiBahan || item.kodeBahan || "-";
      const existing = materialMap.get(name);
      if (existing) {
        existing.sumResource += item.sumResource || 0;
        existing.sumBiaya += item.sumBiaya || 0;
      } else {
        materialMap.set(name, {
          material: name,
          sumResource: item.sumResource || 0,
          sumBiaya: item.sumBiaya || 0,
        });
      }
    }
  }
  const materialItems = Array.from(materialMap.values());

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#17231B] flex items-center gap-2">
              <span>Detail Aktivitas: Group {selectedGroupCost.groupCost}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] font-extrabold">
                Blok {selectedLocation.lokasi}
              </span>
            </h3>
            <p className="text-[11px] text-[#5F6B63]">
              Jurnal riwayat pengerjaan lapangan (kiri) &amp; rincian breakdown tenaga kerja, unit, dan material (kanan).
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Left History Table vs Right Breakdown (50 / 50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT COLUMN: History Aktivitas Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231B] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
              Riwayat Transaksi Aktivitas ({historyActivities.length} data)
            </span>
            <span className="text-[10px] text-[#89938D]">Urut tanggal terlama &rarr; terbaru</span>
          </div>

          {loadingHistory ? (
            <div className="py-16 text-center border border-[#DDE5DF] rounded-xl bg-[#F7F9F7]/50">
              <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#5F6B63]">Memuat history aktivitas...</p>
            </div>
          ) : historyActivities.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
              <AlertCircle className="w-5 h-5 text-[#89938D] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-[#5F6B63]">Belum ada riwayat aktivitas</p>
              <p className="text-[10px] text-[#89938D] mt-0.5">
                Tidak ada data history untuk Group {selectedGroupCost.groupCost} di lokasi {selectedLocation.lokasi}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-xl border border-[#DDE5DF] shadow-2xs scrollbar-thin">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-2xs text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5 whitespace-nowrap bg-[#F7F9F7]">Tanggal</th>
                    <th className="py-2 px-2.5 whitespace-nowrap bg-[#F7F9F7]">Aktivitas</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#F7F9F7]">Hasil</th>
                    <th className="py-2 px-2 whitespace-nowrap bg-[#F7F9F7]">UoM</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#F7F9F7]">Charge (Rp/Ha)</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#F7F9F7]">Material (Rp/Ha)</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap bg-[#F7F9F7]">Upah (Rp/Ha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                  {historyActivities.map((item) => {
                    const isSelected = selectedHistory?.rowLabels === item.rowLabels;
                    const hasilVal =
                      item.hasilCharge > 0
                        ? item.hasilCharge
                        : item.hasilUpah > 0
                        ? item.hasilUpah
                        : item.hasilTotal > 0
                        ? item.hasilTotal
                        : 0;

                    const chargeHa = luasLokasi > 0 && item.costCharge > 0 ? Math.round(item.costCharge / luasLokasi) : 0;
                    const matHa = luasLokasi > 0 && item.costMaterial > 0 ? Math.round(item.costMaterial / luasLokasi) : 0;
                    const upahHa = luasLokasi > 0 && item.costUpah > 0 ? Math.round(item.costUpah / luasLokasi) : 0;

                    return (
                      <tr
                        key={item.rowLabels}
                        onClick={() => onSelectHistory(item)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#16823B]/10 border-l-4 border-l-[#16823B] font-semibold text-[#0B6B32]"
                            : "hover:bg-[#F7F9F7] text-[#17231B]"
                        }`}
                      >
                        <td className="py-2 px-2.5 whitespace-nowrap font-medium text-[11px]">
                          {formatExcelDate(item.tanggalRealisasi)}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap font-bold text-[11px] max-w-[170px] truncate" title={item.deskripsi}>
                          {item.deskripsi}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono whitespace-nowrap text-[11px]">
                          {hasilVal > 0 ? hasilVal.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap text-[10px] text-[#5F6B63]">
                          {item.satuanHasil || "-"}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono whitespace-nowrap text-[11px]">
                          {chargeHa > 0 ? chargeHa.toLocaleString("id-ID") : "-"}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono whitespace-nowrap text-[11px]">
                          {matHa > 0 ? matHa.toLocaleString("id-ID") : "-"}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono whitespace-nowrap text-[11px]">
                          {upahHa > 0 ? upahHa.toLocaleString("id-ID") : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Selected History Breakdown & Kelengkapan */}
        <div className="flex flex-col gap-3 bg-[#F7F9F7]/70 border border-[#DDE5DF] rounded-xl p-3.5">
          {!selectedHistory ? (
            <div className="py-16 text-center">
              <p className="text-xs text-[#5F6B63]">Pilih salah satu baris riwayat di sebelah kiri untuk melihat rincian kelengkapan.</p>
            </div>
          ) : (
            <>
              {/* Header Info & Use Luas Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#DDE5DF]">
                <div>
                  <h4 className="font-bold text-xs text-[#17231B]">{selectedHistory.deskripsi}</h4>
                  <p className="text-[10px] text-[#5F6B63] flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#16823B]" />
                    <span>Realisasi: {formatExcelDate(selectedHistory.tanggalRealisasi)}</span>
                    <span className="text-[#89938D]">&bull;</span>
                    <span className="font-mono text-[#89938D]">{selectedHistory.rowLabels}</span>
                  </p>
                </div>

                {/* Filter Use Luas Toggle */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-[11px] font-bold text-[#17231B] whitespace-nowrap">Gunakan Luas:</span>
                  <div className="inline-flex p-0.5 rounded-lg bg-white border border-[#DDE5DF] text-[10px]">
                    <button
                      onClick={() => setUseLuas("lokasi")}
                      className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap ${
                        useLuas === "lokasi"
                          ? "bg-[#16823B] text-white shadow-xs"
                          : "text-[#5F6B63] hover:text-[#17231B]"
                      }`}
                    >
                      Luas Lokasi ({luasLokasi > 0 ? luasLokasi.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"} Ha)
                    </button>
                    <button
                      onClick={() => setUseLuas("hasil")}
                      className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap ${
                        useLuas === "hasil"
                          ? "bg-[#16823B] text-white shadow-xs"
                          : "text-[#5F6B63] hover:text-[#17231B]"
                      }`}
                    >
                      Luas Hasil ({luasHasil > 0 ? luasHasil.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"} Ha)
                    </button>
                  </div>
                </div>
              </div>

              {loadingKelengkapan ? (
                <div className="py-12 text-center">
                  <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                  <p className="text-xs text-[#5F6B63]">Memuat data kelengkapan...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                  {/* SUB-KOLOM KIRI: Hasil Pengerjaan, Penggunaan TK, dan Unit Alat/Mesin */}
                  <div className="flex flex-col gap-2.5 justify-between">
                    {/* 1. Tabel Hasil */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#17231B] tracking-wider mb-1 block">
                        Hasil Pengerjaan
                      </span>
                      <div className="overflow-hidden rounded-lg border border-[#DDE5DF] bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#F7F9F7] text-[10px] font-bold text-[#5F6B63] border-b border-[#DDE5DF]">
                            <tr>
                              <th className="py-1 px-2.5">Satuan (UoM)</th>
                              <th className="py-1 px-2.5 text-right">Nilai Luas Hasil</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1.5 px-2.5 font-bold text-[#16823B]">
                                {selectedHistory.satuanHasil || "-"}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold">
                                {luasHasil > 0 ? luasHasil.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Tabel Penggunaan TK (diletakkan tepat di bawah Hasil Pengerjaan) */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#17231B] tracking-wider mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#16823B]" />
                        Penggunaan TK (Tenaga Kerja)
                      </span>
                      <div className="overflow-hidden rounded-lg border border-[#DDE5DF] bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#F7F9F7] text-[10px] font-bold text-[#5F6B63] border-b border-[#DDE5DF]">
                            <tr>
                              <th className="py-1 px-2.5">Penggunaan TK (/Ha)</th>
                              <th className="py-1 px-2.5 text-right">Upah (Rp/Ha)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1.5 px-2.5 font-mono font-semibold">
                                {calcPerHa(totalTkResource, false, 2)}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#16823B]">
                                {calcPerHa(totalTkBiaya, true)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Tabel Unit (Group = Charge) (Maksimal 3 baris data, dibuat scroll) */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#17231B] tracking-wider mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-[#16823B]" />
                          Unit Alat / Mesin (Charge)
                        </span>
                        <span className="text-[10px] font-normal text-[#89938D]">
                          {unitItems.length} Unit
                        </span>
                      </span>
                      <div className="overflow-hidden rounded-lg border border-[#DDE5DF] bg-white">
                        <div className="max-h-[114px] overflow-y-auto scrollbar-thin">
                          <table className="w-full text-xs text-left">
                            <thead className="sticky top-0 z-1 bg-[#F7F9F7] text-[10px] font-bold text-[#5F6B63] border-b border-[#DDE5DF] shadow-2xs">
                              <tr>
                                <th className="py-1.5 px-2.5 bg-[#F7F9F7]">Unit</th>
                                <th className="py-1.5 px-2.5 text-right bg-[#F7F9F7]">Amount (Rp/Ha)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DDE5DF]/60">
                              {unitItems.length === 0 ? (
                                <tr>
                                  <td colSpan={2} className="py-4 px-2.5 text-center text-[#89938D] text-[11px]">
                                    - Tidak ada alokasi unit -
                                  </td>
                                </tr>
                              ) : (
                                unitItems.map((u, i) => (
                                  <tr key={i} className="hover:bg-[#F7F9F7]">
                                    <td className="py-1.5 px-2.5 font-mono font-bold text-[11px] text-[#17231B]">
                                      {u.kodeBahan || "-"}
                                    </td>
                                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#16823B]">
                                      {calcPerHa(u.sumBiaya, true)}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUB-KOLOM KANAN: Full untuk Tabel Material Bahan (menyesuaikan tinggi sisi kiri secara presisi, scroll) */}
                  <div className="flex flex-col h-full min-h-[270px]">
                    <span className="text-[10px] font-extrabold uppercase text-[#17231B] tracking-wider mb-1 flex items-center justify-between shrink-0">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#16823B]" />
                        Material Bahan
                      </span>
                      <span className="text-[10px] font-normal text-[#89938D]">
                        {materialItems.length} Material
                      </span>
                    </span>
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-lg border border-[#DDE5DF] bg-white">
                      <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="w-full text-xs text-left">
                          <thead className="sticky top-0 z-1 bg-[#F7F9F7] text-[10px] font-bold text-[#5F6B63] border-b border-[#DDE5DF] shadow-2xs">
                            <tr>
                              <th className="py-1.5 px-2.5 bg-[#F7F9F7]">Material</th>
                              <th className="py-1.5 px-2.5 text-right bg-[#F7F9F7]">Dosis (/Ha)</th>
                              <th className="py-1.5 px-2.5 text-right bg-[#F7F9F7]">Amount (Rp/Ha)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DDE5DF]/60">
                            {materialItems.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="py-16 px-2.5 text-center text-[#89938D] text-[11px]">
                                  - Tidak ada pemakaian material -
                                </td>
                              </tr>
                            ) : (
                              materialItems.map((m, i) => (
                                <tr key={i} className="hover:bg-[#F7F9F7]">
                                  <td className="py-1.5 px-2.5 font-medium text-[11px] max-w-[140px] truncate" title={m.material}>
                                    {m.material}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-[11px]">
                                    {calcPerHa(m.sumResource, false, 2)}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#16823B] text-[11px]">
                                    {calcPerHa(m.sumBiaya, true)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
