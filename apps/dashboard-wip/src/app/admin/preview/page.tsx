"use client";

import { useState, useEffect } from "react";
import { previewService, PreviewTableType } from "@/services/previewService";
import {
  Search,
  Layers,
  ListChecks,
  MapPin,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  History,
  Package,
  Boxes,
} from "lucide-react";

type TabType = PreviewTableType;

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("mastersheet");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 50;

  // Data states
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to format Excel serial date
  const formatExcelDate = (serial: unknown) => {
    if (typeof serial !== "number" || serial <= 0) return String(serial || "-");
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    if (isNaN(date.getTime())) return String(serial);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Helper to format text: empty, null, or "0" -> "-"
  const formatText = (val: unknown): string => {
    if (val === null || val === undefined) return "-";
    const s = String(val).trim();
    if (s === "" || s === "-" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "-";
    return s;
  };

  // Helper to format number: 0, NaN, or null -> "-"
  const formatNumber = (val: unknown, decimals = 0): string => {
    if (val === null || val === undefined) return "-";
    const num = Number(val);
    if (isNaN(num) || num === 0) return "-";
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Reset page when tab or search changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await previewService.getTableData(activeTab, searchQuery, page, limit);
        setTableData(res.data);
        setTotalRecords(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Error fetching preview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, page]);

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "mastersheet", label: "MasterSheet", icon: TableIcon },
    { key: "lokasi", label: "Data Lokasi", icon: MapPin },
    { key: "sbt", label: "Data SBT", icon: Layers },
    { key: "aktivitas", label: "Data Aktivitas", icon: ListChecks },
    { key: "history_aktivitas", label: "History Aktivitas", icon: History },
    { key: "kelengkapan", label: "Kelengkapan", icon: Boxes },
    { key: "akum_bahan", label: "Akumulasi Bahan", icon: Package },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B]">Preview Data Database</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi data mentah dari 7 tabel database WIP (MasterSheet, Lokasi, SBT, Aktivitas, History, Kelengkapan, dan Akumulasi Bahan) dengan sistem paginasi 50 data per halaman.
        </p>
      </div>

      {/* Tabs & Search Bar Container */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-3.5">
          {/* Scrollable 7 Tabs with Touch Scrolling */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-0 max-w-full shrink scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#16823B] text-white shadow-xs"
                      : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B] hover:bg-[#EAEFEF]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Counter */}
          <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
            <div className="relative w-full xl:w-72">
              <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari kata kunci..."
                className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
              />
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl text-[11px] font-bold text-[#16823B] shrink-0">
              {totalRecords.toLocaleString("id-ID")} data
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat data tabel...</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <p className="text-sm font-semibold text-[#5F6B63]">Data tidak ditemukan</p>
            <p className="text-xs text-[#89938D] mt-1">Belum ada data pada tabel ini atau sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div>
            {/* 1. MasterSheet Table */}
            {activeTab === "mastersheet" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Lokasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Wilayah</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Luas (Ha)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Jenis Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kelas Bibit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63] whitespace-nowrap">
                          {item.kodeBibit ? String(item.kodeBibit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{item.jenisBibit ? String(item.jenisBibit) : "-"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{item.kelasBibit ? String(item.kelasBibit) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Data Lokasi Table (Tanpa kolom ID) */}
            {activeTab === "lokasi" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Lokasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Wilayah</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Luas (Ha)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Umur</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Jenis Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kelas Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Group Cost</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Ket. Group Cost</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost / Ha (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Total Cost (Rp)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Pupuk</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode SBT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.status ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{Number(item.umur ?? 0)} Bln</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{String(item.jenisBibit ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.kelasBibit ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">{String(item.groupCost ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{String(item.keteranganGroupCost ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold whitespace-nowrap">
                          {Number(item.costHa ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {Number(item.cost ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-[#5F6B63] whitespace-nowrap">{String(item.pupuk ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B] font-medium whitespace-nowrap">{String(item.kodeSbt ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Data SBT Table */}
            {activeTab === "sbt" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode SBT</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Pupuk</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Jenis Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kelas Bibit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Group Cost</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Umur</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Nilai SBT (Rp / Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold font-mono text-[#16823B] whitespace-nowrap">{String(item.kodeSbt ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.status ?? "-")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.pupuk ?? "-")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.jenis ?? "-")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.kelas ?? "-")}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{String(item.groupCost ?? "-")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{item.umur !== null && item.umur !== undefined ? `${item.umur} Bln` : "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {Number(item.nilaiSbt ?? 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Data Aktivitas Table (Tanpa kolom ID) */}
            {activeTab === "aktivitas" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Lokasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Aktivitas</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Wilayah</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Luas (Ha)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kelas Bibit</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Total Biaya (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost / Ha (Rp)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Group Cost</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Ket. Group Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63] whitespace-nowrap">{item.kode ? String(item.kode) : "-"}</td>
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{String(item.aktivitas ?? "")}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{String(item.kelasBibit ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {Number(item.biaya ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold whitespace-nowrap">
                          {Number(item.costHa ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">{String(item.groupCost ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{String(item.keteranganGroupCost ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. History Aktivitas Table (Row Labels tetap ada, tanpa kolom ID) */}
            {activeTab === "history_aktivitas" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Row Labels</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Tanggal Realisasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Lokasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode Aktifitas</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Deskripsi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Act Cost Group</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Satuan</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost Charge (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Hasil Charge</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost Material (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Hasil Material</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost Upah (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Hasil Upah</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Cost Total (Rp)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Hasil Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B] font-bold whitespace-nowrap">
                          {formatText(item.rowLabels)}
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                          {item.tanggalRealisasi && Number(item.tanggalRealisasi) > 0 ? (
                            <>
                              {formatExcelDate(item.tanggalRealisasi)}
                              <span className="text-[10px] text-[#89938D] ml-1 font-mono">({String(item.tanggalRealisasi)})</span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{formatText(item.lokasi)}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63] whitespace-nowrap">{formatText(item.kodeAktifitas)}</td>
                        <td className="py-2.5 px-3 font-semibold whitespace-nowrap">{formatText(item.deskripsi)}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#16823B] whitespace-nowrap">{formatText(item.actCostGroup)}</td>
                        <td className="py-2.5 px-3 text-[#5F6B63] whitespace-nowrap">{formatText(item.satuanHasil)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.costCharge)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.hasilCharge, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.costMaterial)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.hasilMaterial, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.costUpah)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.hasilUpah, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {formatNumber(item.costTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.hasilTotal, 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. Kelengkapan Table (Row Labels tetap ada, tanpa kolom ID) */}
            {activeTab === "kelengkapan" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Row Labels</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Group</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode Bahan/Alat</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Deskripsi Bahan/Alat</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Satuan</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Sum of Hasil</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Sum of Resource</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Total Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B] font-bold whitespace-nowrap">
                          {formatText(item.rowLabels)}
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{formatText(item.group)}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#5F6B63] whitespace-nowrap">{formatText(item.kodeBahan)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{formatText(item.deskripsiBahan)}</td>
                        <td className="py-2.5 px-3 text-[#5F6B63] whitespace-nowrap">{formatText(item.satuanHasil)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.sumHasil, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {formatNumber(item.sumResource, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
                          {formatNumber(item.sumBiaya)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Akumulasi Bahan Table (Tanpa kolom ID) */}
            {activeTab === "akum_bahan" && (
              <div className="overflow-x-auto max-h-[620px] rounded-xl border border-[#DDE5DF] shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Lokasi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Kode Material</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Deskripsi Material</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#16823B]/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">{formatText(item.lokasi)}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#16823B] whitespace-nowrap">{formatText(item.kodeMaterial)}</td>
                        <td className="py-2.5 px-3 font-semibold whitespace-nowrap">{formatText(item.deskripsiMaterial)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B] whitespace-nowrap">
                          {formatNumber(item.quantity, 1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Responsive Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63]">
              <div className="text-center sm:text-left">
                Menampilkan <span className="font-semibold text-[#17231B]">{startRecord}</span> -{" "}
                <span className="font-semibold text-[#17231B]">{endRecord}</span> dari{" "}
                <span className="font-bold text-[#16823B]">{totalRecords.toLocaleString("id-ID")}</span> data
              </div>

              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3 py-1 bg-[#F7F9F7] rounded-lg border border-[#DDE5DF] font-semibold text-[#17231B] whitespace-nowrap text-xs">
                  Hal {page} dari {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
