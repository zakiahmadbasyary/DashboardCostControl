"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  Table as TableIcon,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpDown,
  Building2,
  MapPin,
} from "lucide-react";

interface SummaryItem {
  pg: string;
  wilayah: string;
  year: number;
  month: number;
  material: string | number;
  upah: string | number;
  batang: string | number;
  jumlahTk: string | number;
  luas: string | number;
}

interface SummaryByPgItem {
  pg: string;
  wilayahCount: number;
  material: number;
  upah: number;
  totalBiaya: number;
  batang: number;
  jumlahTk: number;
  luas: number;
  biayaPerHa: number;
}

interface TransactionItem {
  tanggalRealisasi: string;
  spkId: string | null;
  pg: string;
  wilayah: string;
  lokasi: string | null;
  statusTanaman: string | null;
  tanggalSpk: string | null;
  kodeAktivitas: string | null;
  deskripsi: string | null;
  jenisData: string;
  groupBahanAlat: string | null;
  kodeBahanAlatLainlain: string | null;
  deskripsiBahanAlatLainlain: string | null;
  resourceBahanAlat: string | number | null;
  hasilEfektif: string | number | null;
  satuanHasil: string | null;
  totalRealisasiBiaya: string | number | null;
  costCenterName: string | null;
  orderNo: string | null;
  pasDocument: string | null;
}

export default function SulamAdminPreviewPage() {
  // Tab Switcher: "summary" | "sulam" (Hanya 2 tabel, tidak ada opsi tampilkan kedua tabel)
  const [activeTab, setActiveTab] = useState<"summary" | "sulam">("summary");

  // Tabel 1: Pilihan View Mode ("pg" | "pg_wilayah")
  const [summaryMode, setSummaryMode] = useState<"pg" | "pg_wilayah">("pg");

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);
  const [summaryByPg, setSummaryByPg] = useState<SummaryByPgItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactionsCount, setTotalTransactionsCount] = useState<number>(0);
  const [totals, setTotals] = useState<any>({
    totalMaterial: 0,
    totalUpah: 0,
    totalBiaya: 0,
    totalBatang: 0,
    totalJumlahTk: 0,
    totalLuas: 0,
    biayaPerHa: 0,
  });

  // Filter states
  const [selectedPg, setSelectedPg] = useState<string>("all");
  const [selectedWilayah, setSelectedWilayah] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Transaksi filter & pagination states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJenisData, setSelectedJenisData] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>("50"); // "50", "100", "250", "500", "all"

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPg !== "all") params.append("pg", selectedPg);
      if (selectedWilayah !== "all") params.append("wilayah", selectedWilayah);
      if (selectedYear !== "all") params.append("year", selectedYear);
      if (selectedMonth !== "all") params.append("month", selectedMonth);

      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedJenisData !== "all") params.append("jenisData", selectedJenisData);

      params.append("limit", pageSize);
      params.append("page", String(currentPage));

      const res = await fetch(`/api/admin/preview?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSummaryList(data.summaryList || []);
        setSummaryByPg(data.summaryByPg || []);
        setTransactions(data.transactions || []);
        setTotalTransactionsCount(data.totalTransactionsCount || 0);
        setTotals(data.totals || {});
      }
    } catch (e) {
      console.error("Gagal mengambil data preview Sulam:", e);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPg,
    selectedWilayah,
    selectedYear,
    selectedMonth,
    searchQuery,
    selectedJenisData,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when search or filters change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (val: number | string, decimals = 2) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(totalTransactionsCount / (parseInt(pageSize, 10) || 50)));

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
            Preview Data Sulam
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
            Data rekapitulasi summary dan tabel transaksi lengkap yang tersimpan di database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#17231B] bg-white hover:bg-[#F7F9F7] border border-[#DDE5DF] transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16823B] ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16823B] hover:bg-[#136e32] transition-all shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Data Baru</span>
          </Link>
        </div>
      </div>

      {/* ── Tab Switcher & Master Filters ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#DDE5DF] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Switcher 2 Tab: Tabel Rekapitulasi vs Tabel Sulam */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F9F7] rounded-xl border border-[#DDE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Tabel Rekapitulasi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sulam")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "sulam"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Tabel Sulam ({totalTransactionsCount.toLocaleString("id-ID")})</span>
          </button>
        </div>

        {/* Global Filter PG & Wilayah */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={selectedPg}
            onChange={(e) => handleFilterChange(setSelectedPg, e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] text-xs focus:outline-[#16823B] cursor-pointer"
          >
            <option value="all">Semua PG</option>
            <option value="PG1">PG1</option>
            <option value="PG2">PG2</option>
            <option value="PG3">PG3</option>
          </select>

          <select
            value={selectedWilayah}
            onChange={(e) => handleFilterChange(setSelectedWilayah, e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] text-xs focus:outline-[#16823B] cursor-pointer"
          >
            <option value="all">Semua Wilayah</option>
            {Array.from({ length: 23 }, (_, i) => {
              const code = `AW${(i + 1).toString().padStart(2, "0")}`;
              return (
                <option key={code} value={code}>
                  {code}
                </option>
              );
            })}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => handleFilterChange(setSelectedMonth, e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] text-xs focus:outline-[#16823B] cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((name, i) => (
              <option key={name} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TABEL 1: REKAPITULASI SUMMARY ──                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "summary" && (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
          {/* Header Tabel Rekapitulasi & Pilihan Mode (Per PG / Per PG Wilayah) */}
          <div className="p-4 border-b border-[#DDE5DF] bg-[#FAFCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#17231B]">
                  Tabel Rekapitulasi Data Sulam
                </h2>
                <p className="text-[11px] text-[#5F6B63]">
                  Pilih mode agregasi untuk melihat ringkasan biaya, bibit, tenaga kerja, dan luasan.
                </p>
              </div>
            </div>

            {/* Pilihan: Per PG vs Per PG Wilayah */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#DDE5DF] shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSummaryMode("pg")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  summaryMode === "pg"
                    ? "bg-[#16823B] text-white shadow-xs"
                    : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lihat per PG</span>
              </button>

              <button
                type="button"
                onClick={() => setSummaryMode("pg_wilayah")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  summaryMode === "pg_wilayah"
                    ? "bg-[#16823B] text-white shadow-xs"
                    : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Lihat per PG &amp; Wilayah</span>
              </button>
            </div>
          </div>

          {/* Konten Tabel 1 */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-xs text-[#5F6B63]">
              <RefreshCw className="w-5 h-5 text-[#16823B] animate-spin" />
              <span>Memuat data rekapitulasi...</span>
            </div>
          ) : summaryMode === "pg" ? (
            /* Mode 1: Per PG */
            summaryByPg.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5F6B63]">
                <FileSpreadsheet className="w-8 h-8 text-[#CBE0D1] mx-auto mb-1.5" />
                <p className="font-bold text-[#17231B]">Tidak ada data rekapitulasi PG</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="px-4 py-3">Plantation Group (PG)</th>
                      <th className="px-3 py-3 text-center">Jumlah Wilayah</th>
                      <th className="px-4 py-3 text-right">Biaya Material</th>
                      <th className="px-4 py-3 text-right">Biaya Upah</th>
                      <th className="px-4 py-3 text-right">Total Biaya Sulam</th>
                      <th className="px-4 py-3 text-right">Batang Bibit</th>
                      <th className="px-4 py-3 text-right">Tenaga Kerja (TK)</th>
                      <th className="px-4 py-3 text-right">Luas Efektif (HA)</th>
                      <th className="px-4 py-3 text-right">Biaya / HA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                    {summaryByPg.map((row) => (
                      <tr key={row.pg} className="hover:bg-[#F7F9F7] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#16823B] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#16823B]" />
                          <span>{row.pg}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-[11px]">
                            {row.wilayahCount} Wilayah
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(row.material)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(row.upah)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#17231B]">
                          {formatCurrency(row.totalBiaya)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatNumber(row.batang, 0)} btg
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatNumber(row.jumlahTk, 1)} TK
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatNumber(row.luas, 2)} HA
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#16823B]">
                          {formatCurrency(row.biayaPerHa)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Baris Bawah */}
                  <tfoot className="bg-[#EAF3EC]/60 border-t-2 border-[#16823B]/30 font-black text-[#17231B]">
                    <tr>
                      <td className="px-4 py-3 uppercase tracking-wider text-xs">
                        TOTAL KESELURUHAN
                      </td>
                      <td className="px-3 py-3 text-center">-</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(totals.totalMaterial)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(totals.totalUpah)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#16823B]">
                        {formatCurrency(totals.totalBiaya)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(totals.totalBatang, 0)} btg
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(totals.totalJumlahTk, 1)} TK
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(totals.totalLuas, 2)} HA
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#16823B]">
                        {formatCurrency(totals.biayaPerHa)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          ) : (
            /* Mode 2: Per PG & Wilayah */
            summaryList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5F6B63]">
                <FileSpreadsheet className="w-8 h-8 text-[#CBE0D1] mx-auto mb-1.5" />
                <p className="font-bold text-[#17231B]">Tidak ada data rekapitulasi Wilayah</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">PG</th>
                      <th className="px-3 py-3">Wilayah</th>
                      <th className="px-3 py-3">Periode</th>
                      <th className="px-4 py-3 text-right">Biaya Material</th>
                      <th className="px-4 py-3 text-right">Biaya Upah</th>
                      <th className="px-4 py-3 text-right">Total Biaya</th>
                      <th className="px-4 py-3 text-right">Batang Bibit</th>
                      <th className="px-4 py-3 text-right">Tenaga Kerja</th>
                      <th className="px-4 py-3 text-right">Luas (HA)</th>
                      <th className="px-4 py-3 text-right">Biaya / HA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                    {summaryList.map((row, idx) => {
                      const mat = Number(row.material) || 0;
                      const uph = Number(row.upah) || 0;
                      const tot = mat + uph;
                      const luasNum = Number(row.luas) || 0;
                      const perHa = luasNum > 0 ? tot / luasNum : 0;

                      return (
                        <tr
                          key={`${row.pg}-${row.wilayah}-${row.year}-${row.month}-${idx}`}
                          className="hover:bg-[#F7F9F7] transition-colors"
                        >
                          <td className="px-4 py-2.5 font-bold text-[#16823B]">{row.pg}</td>
                          <td className="px-3 py-2.5 font-bold text-[#17231B]">{row.wilayah}</td>
                          <td className="px-3 py-2.5 font-mono text-[#5F6B63]">
                            {row.year}-{String(row.month).padStart(2, "0")}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {formatCurrency(mat)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {formatCurrency(uph)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-[#17231B]">
                            {formatCurrency(tot)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {formatNumber(row.batang, 0)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {formatNumber(row.jumlahTk, 1)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {formatNumber(row.luas, 2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[#16823B] font-semibold">
                            {formatCurrency(perHa)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#EAF3EC]/60 border-t-2 border-[#16823B]/30 font-black text-[#17231B] sticky bottom-0 z-10">
                    <tr>
                      <td colSpan={3} className="px-4 py-2.5 uppercase tracking-wider text-xs">
                        TOTAL REKAPITULASI ({summaryList.length} Baris)
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatCurrency(totals.totalMaterial)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatCurrency(totals.totalUpah)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#16823B]">
                        {formatCurrency(totals.totalBiaya)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatNumber(totals.totalBatang, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatNumber(totals.totalJumlahTk, 1)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatNumber(totals.totalLuas, 2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#16823B]">
                        {formatCurrency(totals.biayaPerHa)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TABEL 2: TABEL SULAM (SEMUA TRANSAKSI) ──                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "sulam" && (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
          {/* Header Tabel Transaksi & Search / Filter Bar */}
          <div className="p-4 border-b border-[#DDE5DF] bg-[#FAFCFA] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                  <TableIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#17231B]">
                    Tabel Data Transaksi Sulam
                  </h2>
                  <p className="text-[11px] text-[#5F6B63]">
                    Menampilkan seluruh data transaksi sulam tanpa kolom ID &amp; Kode.
                  </p>
                </div>
              </div>

              {/* Tampilkan Semua / Limit Selector */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-[#5F6B63]">Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-bold text-[#16823B] focus:outline-[#16823B] cursor-pointer"
                >
                  <option value="50">50 Baris</option>
                  <option value="100">100 Baris</option>
                  <option value="250">250 Baris</option>
                  <option value="500">500 Baris</option>
                  <option value="all">Semua ({totalTransactionsCount.toLocaleString("id-ID")} Data)</option>
                </select>
              </div>
            </div>

            {/* Sub-bar Filter Pencarian & Jenis Data */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari SPK, lokasi, wilayah, atau deskripsi pekerjaan..."
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs text-[#17231B] placeholder:text-[#89938D] focus:outline-[#16823B]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 p-0.5 bg-[#F7F9F7] rounded-lg border border-[#DDE5DF]">
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setSelectedJenisData, "all")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      selectedJenisData === "all"
                        ? "bg-white text-[#16823B] shadow-2xs"
                        : "text-[#5F6B63] hover:text-[#17231B]"
                    }`}
                  >
                    Semua Jenis
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setSelectedJenisData, "Upah")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      selectedJenisData === "Upah"
                        ? "bg-amber-100 text-amber-800 shadow-2xs"
                        : "text-[#5F6B63] hover:text-[#17231B]"
                    }`}
                  >
                    Upah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setSelectedJenisData, "Material")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      selectedJenisData === "Material"
                        ? "bg-blue-100 text-blue-800 shadow-2xs"
                        : "text-[#5F6B63] hover:text-[#17231B]"
                    }`}
                  >
                    Material
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Konten Tabel Transaksi Sulam */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-xs text-[#5F6B63]">
              <RefreshCw className="w-5 h-5 text-[#16823B] animate-spin" />
              <span>Memuat seluruh transaksi sulam...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5F6B63]">
              <FileSpreadsheet className="w-10 h-10 text-[#CBE0D1] mx-auto mb-2" />
              <p className="font-bold text-[#17231B] text-sm">Tidak ada transaksi ditemukan</p>
              <p className="mt-1">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[560px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="px-3 py-3 text-center">No</th>
                    <th className="px-3 py-3">Tgl Realisasi</th>
                    <th className="px-3 py-3">SPK ID</th>
                    <th className="px-2 py-3 text-center">PG</th>
                    <th className="px-2 py-3 text-center">Wilayah</th>
                    <th className="px-2 py-3">Lokasi</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-3 py-3">Aktivitas</th>
                    <th className="px-4 py-3 min-w-[200px]">Deskripsi Pekerjaan</th>
                    <th className="px-3 py-3">Jenis Data</th>
                    <th className="px-3 py-3">Group Bahan/Alat</th>
                    <th className="px-4 py-3 text-right">Resource (Qty)</th>
                    <th className="px-3 py-3 text-right">Hasil (HA)</th>
                    <th className="px-2 py-3 text-center">Satuan</th>
                    <th className="px-4 py-3 text-right">Total Biaya Realisasi</th>
                    <th className="px-3 py-3">Cost Center</th>
                    <th className="px-3 py-3">Order No / PAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {transactions.map((tx, idx) => {
                    const rowNumber =
                      pageSize === "all"
                        ? idx + 1
                        : (currentPage - 1) * parseInt(pageSize, 10) + idx + 1;

                    return (
                      <tr
                        key={`${tx.spkId || ""}-${tx.wilayah}-${tx.lokasi || ""}-${idx}`}
                        className="hover:bg-[#F7F9F7] transition-colors"
                      >
                        <td className="px-3 py-2 text-center font-mono text-[#89938D] text-[11px]">
                          {rowNumber}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {tx.tanggalRealisasi
                            ? new Date(tx.tanggalRealisasi).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#16823B] font-bold">
                          {tx.spkId || "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-bold text-[#5F6B63]">{tx.pg}</td>
                        <td className="px-2 py-2 text-center font-bold text-[#17231B]">
                          {tx.wilayah}
                        </td>
                        <td className="px-2 py-2 font-mono">{tx.lokasi || "-"}</td>
                        <td className="px-2 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-[#5F6B63] font-semibold">
                            {tx.statusTanaman || "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[#5F6B63]">
                          {tx.kodeAktivitas || "-"}
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate" title={tx.deskripsi || ""}>
                          {tx.deskripsi || "-"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.jenisData?.toLowerCase().includes("material")
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {tx.jenisData}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#5F6B63]">{tx.groupBahanAlat || "-"}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold">
                          {formatNumber(tx.resourceBahanAlat || 0, 1)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatNumber(tx.hasilEfektif || 0, 2)}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-[#89938D] text-[11px]">
                          {tx.satuanHasil || "HA"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-[#16823B]">
                          {formatCurrency(tx.totalRealisasiBiaya || 0)}
                        </td>
                        <td className="px-3 py-2 text-[#5F6B63] text-[11px]">
                          {tx.costCenterName || "-"}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-[#89938D]">
                          {tx.orderNo || tx.pasDocument || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Bar & Pagination */}
          <div className="p-3 border-t border-[#DDE5DF] bg-[#FAFCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5F6B63]">
            <div>
              {pageSize === "all" ? (
                <span>
                  Menampilkan seluruh{" "}
                  <strong className="text-[#17231B]">
                    {transactions.length.toLocaleString("id-ID")}
                  </strong>{" "}
                  data transaksi sulam.
                </span>
              ) : (
                <span>
                  Menampilkan baris{" "}
                  <strong className="text-[#17231B]">
                    {(currentPage - 1) * parseInt(pageSize, 10) + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-[#17231B]">
                    {Math.min(currentPage * parseInt(pageSize, 10), totalTransactionsCount)}
                  </strong>{" "}
                  dari total{" "}
                  <strong className="text-[#17231B]">
                    {totalTransactionsCount.toLocaleString("id-ID")}
                  </strong>{" "}
                  transaksi.
                </span>
              )}
            </div>

            {/* Pagination Controls */}
            {pageSize !== "all" && totalPages > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] text-[#17231B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DDE5DF] font-bold text-[#17231B] text-xs font-mono">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] text-[#17231B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
