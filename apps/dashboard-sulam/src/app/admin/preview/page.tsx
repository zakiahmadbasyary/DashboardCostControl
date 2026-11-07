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
  Building2,
  MapPin,
  Calendar,
  UserCheck,
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
  mandor: string | null;
  costCenterName: string | null;
  orderNo: string | null;
  pasDocument: string | null;
}

interface DataMandorItem {
  tanggalRealisasi: string;
  mandor: string;
  pg: string;
  wilayah: string;
  year: number;
  month: number;
  tk: string | number;
  batang: string | number;
  batangPerTk: string | number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export default function SulamAdminPreviewPage() {
  // Tab Switcher: "summary" | "sulam" | "mandor" (Hanya 1 tabel yang aktif dalam satu waktu)
  const [activeTab, setActiveTab] = useState<"summary" | "sulam" | "mandor">("summary");

  // Tabel Rekapitulasi Mode: "pg" | "pg_wilayah"
  const [summaryMode, setSummaryMode] = useState<"pg" | "pg_wilayah">("pg");

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025]);
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactionsCount, setTotalTransactionsCount] = useState<number>(0);
  const [dataMandorList, setDataMandorList] = useState<DataMandorItem[]>([]);
  const [totalMandorCount, setTotalMandorCount] = useState<number>(0);

  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedPg, setSelectedPg] = useState<string>("all");
  const [selectedWilayah, setSelectedWilayah] = useState<string>("all");

  // Transaksi filter & pagination states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJenisData, setSelectedJenisData] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
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
        if (data.availableYears && data.availableYears.length > 0) {
          setAvailableYears(data.availableYears);
          if (!data.availableYears.includes(Number(selectedYear))) {
            setSelectedYear(String(data.availableYears[0]));
          }
        }
        setSummaryList(data.summaryList || []);
        setTransactions(data.transactions || []);
        setTotalTransactionsCount(data.totalTransactionsCount || 0);
        setDataMandorList(data.dataMandorList || []);
        setTotalMandorCount(data.totalDataMandorCount || 0);
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

  // Formatter Angka Standar Indonesia (Sesuai Gambar Acuan)
  const formatCostOrQty = (val: number | string | null | undefined): string => {
    const num = Math.round(Number(val) || 0);
    if (num === 0) return "-";
    return num.toLocaleString("id-ID");
  };

  const formatLuas = (val: number | string | null | undefined): string => {
    const num = Number(val) || 0;
    if (num === 0) return "-";
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
      : Math.max(
          1,
          Math.ceil(
            (activeTab === "mandor" ? totalMandorCount : totalTransactionsCount) /
              (parseInt(pageSize, 10) || 50)
          )
        );

  // List entitas untuk tabel rekapitulasi matriks
  const pgEntities =
    selectedPg === "all" ? ["PG1", "PG2", "PG3"] : [selectedPg];

  const allWilayahs = Array.from(
    new Set(
      summaryList
        .filter((s) => selectedPg === "all" || s.pg === selectedPg)
        .map((s) => s.wilayah)
    )
  ).sort();

  const wilayahEntities =
    selectedWilayah === "all"
      ? allWilayahs
      : allWilayahs.filter((w) => w === selectedWilayah);

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
            Preview Data Sulam
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
            Data rekapitulasi matriks bulanan dan tabel transaksi lengkap yang tersimpan di database.
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

      {/* ── Tab Switcher: 3 Tab Bersih (Rekapitulasi vs Sulam vs Mandor) ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#DDE5DF] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Switcher 3 Tab */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F9F7] rounded-xl border border-[#DDE5DF]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("summary");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <Layers className="w-4 h-4 text-[#16823B]" />
            <span>Tabel Rekapitulasi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("sulam");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "sulam"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <TableIcon className="w-4 h-4 text-[#16823B]" />
            <span>Tabel Sulam ({totalTransactionsCount.toLocaleString("id-ID")})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("mandor");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "mandor"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#16823B]" />
            <span>Data Mandor ({totalMandorCount.toLocaleString("id-ID")})</span>
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          {/* Filter Tahun */}
          <div className="flex items-center gap-1.5 bg-[#F7F9F7] px-2.5 py-1 rounded-lg border border-[#DDE5DF]">
            <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
            <span className="text-[#5F6B63] font-semibold">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-[#17231B] text-xs focus:outline-hidden cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter PG (Disembunyikan jika di Tab Data Mandor karena khusus PG1) */}
          {activeTab !== "mandor" && (
            <select
              value={selectedPg}
              onChange={(e) => {
                setSelectedPg(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] text-xs focus:outline-[#16823B] cursor-pointer"
            >
              <option value="all">Semua PG</option>
              <option value="PG1">PG1</option>
              <option value="PG2">PG2</option>
              <option value="PG3">PG3</option>
            </select>
          )}

          {/* Filter Wilayah (Aktif jika di tab Sulam, tab Mandor, atau mode Wilayah) */}
          {(activeTab === "sulam" || activeTab === "mandor" || summaryMode === "pg_wilayah") && (
            <select
              value={selectedWilayah}
              onChange={(e) => {
                setSelectedWilayah(e.target.value);
                setCurrentPage(1);
              }}
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
          )}

          {/* Filter Bulan (Khusus Tab Transaksi Sulam & Data Mandor) */}
          {(activeTab === "sulam" || activeTab === "mandor") && (
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
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
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TABEL 1: TABEL REKAPITULASI (GAYA ACUAN EXCEL GAMBAR) ──    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "summary" && (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
          {/* Header Sub-bar: Judul & Toggle Mode (Per PG vs Per PG Wilayah) */}
          <div className="p-4 border-b border-[#DDE5DF] bg-[#FAFCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#17231B]">
                  Tabel Rekapitulasi Data Sulam --- Tahun {selectedYear}
                </h2>
                <p className="text-[11px] text-[#5F6B63]">
                  Format matriks bulanan (Januari s/d Desember) untuk Cost Material, Upah, Qty Bibit, Jumlah TK, dan Luas.
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

          {/* Konten Matriks Rekapitulasi Bulanan */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-xs text-[#5F6B63]">
              <RefreshCw className="w-5 h-5 text-[#16823B] animate-spin" />
              <span>Memuat matriks data rekapitulasi...</span>
            </div>
          ) : summaryList.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5F6B63]">
              <FileSpreadsheet className="w-10 h-10 text-[#CBE0D1] mx-auto mb-2" />
              <p className="font-bold text-[#17231B] text-sm">Tidak ada data rekapitulasi</p>
              <p className="mt-1">Coba sesuaikan filter tahun atau upload data baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-xs text-left border-collapse border border-[#DDE5DF]">
                {/* ── THEAD DUA TINGKAT SESUAI GAMBAR ACUAN ── */}
                <thead className="bg-[#F7F9F7] text-[#17231B] font-bold">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border border-[#DDE5DF] px-4 py-2.5 text-center align-middle font-extrabold text-[#17231B] min-w-[90px]"
                    >
                      Asal
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-[#DDE5DF] px-3 py-2.5 text-center align-middle font-extrabold text-[#17231B] min-w-[70px]"
                    >
                      Bulan
                    </th>
                    <th
                      colSpan={2}
                      className="border border-[#DDE5DF] px-4 py-2 text-center font-extrabold text-[#17231B]"
                    >
                      Cost
                    </th>
                    <th
                      colSpan={2}
                      className="border border-[#DDE5DF] px-4 py-2 text-center font-extrabold text-[#17231B]"
                    >
                      Qty
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-[#DDE5DF] px-4 py-2.5 text-center align-middle font-extrabold text-[#17231B] min-w-[80px]"
                    >
                      Luas
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-[#DDE5DF] px-3 py-2 text-center font-bold text-[#17231B] bg-[#F7F9F7]">
                      Material
                    </th>
                    <th className="border border-[#DDE5DF] px-3 py-2 text-center font-bold text-[#17231B] bg-[#F7F9F7]">
                      Upah
                    </th>
                    <th className="border border-[#DDE5DF] px-3 py-2 text-center font-bold text-[#17231B] bg-[#F7F9F7]">
                      Bibit
                    </th>
                    <th className="border border-[#DDE5DF] px-3 py-2 text-center font-bold text-[#17231B] bg-[#F7F9F7]">
                      Jumlah TK
                    </th>
                  </tr>
                </thead>

                {/* ── TBODY: MODE PER PG ── */}
                {summaryMode === "pg" &&
                  pgEntities.map((pg) => {
                    const rowsForPg = Array.from({ length: 12 }, (_, i) => {
                      const monthNum = i + 1;
                      const matchItems = summaryList.filter(
                        (s) => s.pg === pg && Number(s.month) === monthNum
                      );
                      const material = matchItems.reduce(
                        (acc, c) => acc + (Number(c.material) || 0),
                        0
                      );
                      const upah = matchItems.reduce(
                        (acc, c) => acc + (Number(c.upah) || 0),
                        0
                      );
                      const batang = matchItems.reduce(
                        (acc, c) => acc + (Number(c.batang) || 0),
                        0
                      );
                      const jumlahTk = matchItems.reduce(
                        (acc, c) => acc + (Number(c.jumlahTk) || 0),
                        0
                      );
                      const luas = matchItems.reduce(
                        (acc, c) => acc + (Number(c.luas) || 0),
                        0
                      );

                      return {
                        monthNum,
                        monthName: MONTH_NAMES[i],
                        material,
                        upah,
                        batang,
                        jumlahTk,
                        luas,
                      };
                    });

                    const totalPg = rowsForPg.reduce(
                      (acc, r) => {
                        acc.material += r.material;
                        acc.upah += r.upah;
                        acc.batang += r.batang;
                        acc.jumlahTk += r.jumlahTk;
                        acc.luas += r.luas;
                        return acc;
                      },
                      { material: 0, upah: 0, batang: 0, jumlahTk: 0, luas: 0 }
                    );

                    return (
                      <tbody
                        key={pg}
                        className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]"
                      >
                        {rowsForPg.map((row, idx) => (
                          <tr
                            key={`${pg}-${row.monthNum}`}
                            className="hover:bg-[#16823B]/5 transition-colors"
                          >
                            {/* Sel Asal digabung vertikal rowspan=12 persis gambar */}
                            {idx === 0 && (
                              <td
                                rowSpan={12}
                                className="border border-[#DDE5DF] px-4 py-3 text-center align-middle font-bold text-sm text-[#17231B] bg-white tracking-wide"
                              >
                                {pg}
                              </td>
                            )}
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-center font-semibold text-[#17231B] bg-[#FAFCFA]">
                              {row.monthName}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.material)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.upah)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.batang)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.jumlahTk)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatLuas(row.luas)}
                            </td>
                          </tr>
                        ))}

                        {/* Baris Total Akumulasi per PG */}
                        <tr className="bg-[#EAF3EC]/60 font-black border-t-2 border-[#16823B]/30">
                          <td
                            colSpan={2}
                            className="border border-[#DDE5DF] px-4 py-2 text-center uppercase tracking-wider text-[11px] font-extrabold text-[#16823B]"
                          >
                            Total {pg}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#16823B]">
                            {formatCostOrQty(totalPg.material)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#16823B]">
                            {formatCostOrQty(totalPg.upah)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatCostOrQty(totalPg.batang)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatCostOrQty(totalPg.jumlahTk)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatLuas(totalPg.luas)}
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}

                {/* ── TBODY: MODE PER PG & WILAYAH ── */}
                {summaryMode === "pg_wilayah" &&
                  wilayahEntities.map((wilayah) => {
                    const rowsForWilayah = Array.from({ length: 12 }, (_, i) => {
                      const monthNum = i + 1;
                      const matchItems = summaryList.filter(
                        (s) => s.wilayah === wilayah && Number(s.month) === monthNum
                      );
                      const material = matchItems.reduce(
                        (acc, c) => acc + (Number(c.material) || 0),
                        0
                      );
                      const upah = matchItems.reduce(
                        (acc, c) => acc + (Number(c.upah) || 0),
                        0
                      );
                      const batang = matchItems.reduce(
                        (acc, c) => acc + (Number(c.batang) || 0),
                        0
                      );
                      const jumlahTk = matchItems.reduce(
                        (acc, c) => acc + (Number(c.jumlahTk) || 0),
                        0
                      );
                      const luas = matchItems.reduce(
                        (acc, c) => acc + (Number(c.luas) || 0),
                        0
                      );

                      return {
                        monthNum,
                        monthName: MONTH_NAMES[i],
                        material,
                        upah,
                        batang,
                        jumlahTk,
                        luas,
                      };
                    });

                    const totalWilayah = rowsForWilayah.reduce(
                      (acc, r) => {
                        acc.material += r.material;
                        acc.upah += r.upah;
                        acc.batang += r.batang;
                        acc.jumlahTk += r.jumlahTk;
                        acc.luas += r.luas;
                        return acc;
                      },
                      { material: 0, upah: 0, batang: 0, jumlahTk: 0, luas: 0 }
                    );

                    return (
                      <tbody
                        key={wilayah}
                        className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]"
                      >
                        {rowsForWilayah.map((row, idx) => (
                          <tr
                            key={`${wilayah}-${row.monthNum}`}
                            className="hover:bg-[#16823B]/5 transition-colors"
                          >
                            {/* Sel Asal digabung vertikal rowspan=12 */}
                            {idx === 0 && (
                              <td
                                rowSpan={12}
                                className="border border-[#DDE5DF] px-4 py-3 text-center align-middle font-bold text-sm text-[#17231B] bg-white tracking-wide"
                              >
                                {wilayah}
                              </td>
                            )}
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-center font-semibold text-[#17231B] bg-[#FAFCFA]">
                              {row.monthName}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.material)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.upah)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.batang)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatCostOrQty(row.jumlahTk)}
                            </td>
                            <td className="border border-[#DDE5DF] px-3 py-1.5 text-right font-mono text-[#17231B]">
                              {formatLuas(row.luas)}
                            </td>
                          </tr>
                        ))}

                        {/* Baris Total per Wilayah */}
                        <tr className="bg-[#EAF3EC]/60 font-black border-t-2 border-[#16823B]/30">
                          <td
                            colSpan={2}
                            className="border border-[#DDE5DF] px-4 py-2 text-center uppercase tracking-wider text-[11px] font-extrabold text-[#16823B]"
                          >
                            Total {wilayah}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#16823B]">
                            {formatCostOrQty(totalWilayah.material)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#16823B]">
                            {formatCostOrQty(totalWilayah.upah)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatCostOrQty(totalWilayah.batang)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatCostOrQty(totalWilayah.jumlahTk)}
                          </td>
                          <td className="border border-[#DDE5DF] px-3 py-2 text-right font-mono text-[#17231B]">
                            {formatLuas(totalWilayah.luas)}
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
              </table>
            </div>
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
                  <option value="all">
                    Semua ({totalTransactionsCount.toLocaleString("id-ID")} Data)
                  </option>
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs text-[#17231B] placeholder:text-[#89938D] focus:outline-[#16823B]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 p-0.5 bg-[#F7F9F7] rounded-lg border border-[#DDE5DF]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenisData("all");
                      setCurrentPage(1);
                    }}
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
                    onClick={() => {
                      setSelectedJenisData("Upah");
                      setCurrentPage(1);
                    }}
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
                    onClick={() => {
                      setSelectedJenisData("Material");
                      setCurrentPage(1);
                    }}
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
                    <th className="px-3 py-3">Mandor</th>
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
                        <td className="px-3 py-2 text-[#17231B] font-medium text-[11px]">
                          {tx.mandor || "-"}
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

      {/* ── TAB 3: DATA MANDOR PG1 ── */}
      {activeTab === "mandor" && (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
          {/* Header Sub-bar */}
          <div className="p-4 border-b border-[#DDE5DF] bg-[#FAFCFA] flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#17231B] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#16823B]" />
                  <span>Preview Data Mandor (PG1)</span>
                </h2>
                <p className="text-xs text-[#5F6B63] mt-0.5">
                  Rekapitulasi rasio penanaman (Batang/TK) dan akumulasi tenaga kerja per mandor pada setiap tanggal realisasi.
                </p>
              </div>

              {/* Page size selector */}
              <div className="flex items-center gap-2 text-xs">
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
                  <option value="all">
                    Semua ({totalMandorCount.toLocaleString("id-ID")} Data)
                  </option>
                </select>
              </div>
            </div>

            {/* Sub-bar Filter Pencarian Mandor */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama mandor atau wilayah..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs text-[#17231B] placeholder:text-[#89938D] focus:outline-[#16823B]"
                />
              </div>

              <div className="text-xs text-[#5F6B63]">
                Total: <strong className="text-[#17231B]">{totalMandorCount.toLocaleString("id-ID")}</strong> data mandor tercatat
              </div>
            </div>
          </div>

          {/* Konten Tabel Data Mandor */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-xs text-[#5F6B63]">
              <RefreshCw className="w-5 h-5 text-[#16823B] animate-spin" />
              <span>Memuat data mandor...</span>
            </div>
          ) : dataMandorList.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5F6B63]">
              <UserCheck className="w-10 h-10 text-[#CBE0D1] mx-auto mb-2" />
              <p className="font-bold text-[#17231B] text-sm">Belum ada data mandor</p>
              <p className="mt-1">
                Data mandor akan otomatis terisi saat Anda mengunggah file Excel sulam di menu Upload.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[560px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="px-3 py-3 text-center">No</th>
                    <th className="px-3 py-3">Tgl Realisasi</th>
                    <th className="px-4 py-3">Mandor</th>
                    <th className="px-3 py-3 text-center">PG</th>
                    <th className="px-3 py-3 text-center">Wilayah</th>
                    <th className="px-3 py-3 text-center">Tahun</th>
                    <th className="px-3 py-3 text-center">Bulan</th>
                    <th className="px-4 py-3 text-right">TK (Resource Upah)</th>
                    <th className="px-4 py-3 text-right">Batang (Resource Material)</th>
                    <th className="px-4 py-3 text-right text-[#16823B]">Batang / TK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {dataMandorList.map((item, idx) => {
                    const rowNumber =
                      pageSize === "all"
                        ? idx + 1
                        : (currentPage - 1) * parseInt(pageSize, 10) + idx + 1;

                    const tkVal = Number(item.tk) || 0;
                    const batangVal = Number(item.batang) || 0;
                    const ratioVal = Number(item.batangPerTk) || 0;

                    return (
                      <tr
                        key={`${item.mandor}-${item.tanggalRealisasi}-${idx}`}
                        className="hover:bg-[#F7F9F7] transition-colors"
                      >
                        <td className="px-3 py-2 text-center font-mono text-[#89938D] text-[11px]">
                          {rowNumber}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {item.tanggalRealisasi
                            ? new Date(item.tanggalRealisasi).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="px-4 py-2 font-bold text-[#17231B]">
                          {item.mandor}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#16823B] border border-[#CBE0D1]">
                            {item.pg}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-[#17231B]">
                          {item.wilayah}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-[#5F6B63]">
                          {item.year}
                        </td>
                        <td className="px-3 py-2 text-center font-medium text-[#5F6B63]">
                          {MONTH_NAMES[item.month - 1] || item.month}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-[#17231B]">
                          {formatNumber(tkVal, 2)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-[#17231B]">
                          {formatNumber(batangVal, 0)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-black text-[#16823B] bg-[#F7F9F7]/50">
                          {formatNumber(ratioVal, 2)}
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
                  Menampilkan seluruh <strong>{totalMandorCount.toLocaleString("id-ID")}</strong> data mandor
                </span>
              ) : (
                <span>
                  Menampilkan{" "}
                  <strong className="text-[#17231B]">
                    {totalMandorCount === 0
                      ? 0
                      : (currentPage - 1) * parseInt(pageSize, 10) + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-[#17231B]">
                    {Math.min(currentPage * parseInt(pageSize, 10), totalMandorCount)}
                  </strong>{" "}
                  dari total{" "}
                  <strong className="text-[#17231B]">
                    {totalMandorCount.toLocaleString("id-ID")}
                  </strong>{" "}
                  data mandor.
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
