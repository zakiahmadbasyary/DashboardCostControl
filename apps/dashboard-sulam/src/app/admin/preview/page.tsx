"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  DollarSign,
  Sprout,
  Users,
  MapPin,
  RefreshCw,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface SummaryItem {
  kode: string;
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
  idSulam: string | number;
  tanggalRealisasi: string;
  spkId: string | null;
  wilayah: string;
  lokasi: string | null;
  kodeAktivitas: string | null;
  jenisData: string;
  jenis: string;
  resourceBahanAlat: string | number | null;
  hasilEfektif: string | number | null;
  totalRealisasiBiaya: string | number | null;
  pg: string;
  kode: string;
}

export default function SulamAdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "detail">("summary");
  const [loading, setLoading] = useState(true);
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [stats, setStats] = useState<any>({
    totalSulamCount: 0,
    totalSummaryCount: 0,
    totalMaterial: 0,
    totalUpah: 0,
    totalBatang: 0,
    totalJumlahTk: 0,
    totalLuas: 0,
  });

  const [selectedPg, setSelectedPg] = useState("all");
  const [selectedWilayah, setSelectedWilayah] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPg !== "all") params.append("pg", selectedPg);
      if (selectedWilayah !== "all") params.append("wilayah", selectedWilayah);

      const res = await fetch(`/api/admin/preview?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSummaryList(data.summaryList || []);
        setTransactions(data.transactions || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error("Gagal mengambil data preview Sulam:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPg, selectedWilayah]);

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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#17231B] tracking-tight">Preview Data Sulam</h1>
          <p className="text-sm text-[#5F6B63] mt-1">
            Lihat rekapitulasi ringkasan kode summary dan sampel baris transaksi yang tersimpan di database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5F6B63] bg-white hover:bg-[#F7F9F7] border border-[#DDE5DF] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#16823B] hover:bg-[#136e32] shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Data Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-[#DDE5DF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6B63]">Total Biaya Material</span>
            <DollarSign className="w-4 h-4 text-[#16823B]" />
          </div>
          <p className="text-lg font-black text-[#17231B] mt-2 tracking-tight">
            {formatCurrency(stats.totalMaterial)}
          </p>
          <p className="text-[11px] text-[#5F6B63] mt-0.5">Biaya bibit & bahan</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#DDE5DF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6B63]">Total Biaya Upah</span>
            <Users className="w-4 h-4 text-[#16823B]" />
          </div>
          <p className="text-lg font-black text-[#17231B] mt-2 tracking-tight">
            {formatCurrency(stats.totalUpah)}
          </p>
          <p className="text-[11px] text-[#5F6B63] mt-0.5">Tenaga kerja penyulaman</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#DDE5DF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6B63]">Total Batang Bibit</span>
            <Sprout className="w-4 h-4 text-[#16823B]" />
          </div>
          <p className="text-lg font-black text-[#17231B] mt-2 tracking-tight">
            {formatNumber(stats.totalBatang, 0)} <span className="text-xs font-medium text-[#5F6B63]">btg</span>
          </p>
          <p className="text-[11px] text-[#5F6B63] mt-0.5">Resource material</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#DDE5DF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6B63]">Total Tenaga Kerja</span>
            <Users className="w-4 h-4 text-[#16823B]" />
          </div>
          <p className="text-lg font-black text-[#17231B] mt-2 tracking-tight">
            {formatNumber(stats.totalJumlahTk, 1)} <span className="text-xs font-medium text-[#5F6B63]">TK</span>
          </p>
          <p className="text-[11px] text-[#5F6B63] mt-0.5">Resource upah</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#DDE5DF] shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6B63]">Total Luas Efektif</span>
            <MapPin className="w-4 h-4 text-[#16823B]" />
          </div>
          <p className="text-lg font-black text-[#17231B] mt-2 tracking-tight">
            {formatNumber(stats.totalLuas, 2)} <span className="text-xs font-medium text-[#5F6B63]">HA</span>
          </p>
          <p className="text-[11px] text-[#5F6B63] mt-0.5">
            {stats.totalSulamCount.toLocaleString("id-ID")} Transaksi
          </p>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDE5DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F9F7] rounded-xl border border-[#DDE5DF]">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "summary"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            Rekap Summary ({summaryList.length})
          </button>
          <button
            onClick={() => setActiveTab("detail")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "detail"
                ? "bg-white text-[#16823B] shadow-2xs"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            Sampel Transaksi ({transactions.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={selectedPg}
            onChange={(e) => setSelectedPg(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] focus:outline-[#16823B]"
          >
            <option value="all">Semua PG</option>
            <option value="PG1">PG1</option>
            <option value="PG2">PG2</option>
            <option value="PG3">PG3</option>
          </select>

          <select
            value={selectedWilayah}
            onChange={(e) => setSelectedWilayah(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white font-medium text-[#17231B] focus:outline-[#16823B]"
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
        </div>
      </div>

      {/* Tabel Konten */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs font-semibold text-[#5F6B63]">
            <RefreshCw className="w-6 h-6 text-[#16823B] animate-spin" />
            <span>Memuat data dari database...</span>
          </div>
        ) : activeTab === "summary" ? (
          summaryList.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5F6B63]">
              <FileSpreadsheet className="w-10 h-10 text-[#CBE0D1] mx-auto mb-2" />
              <p className="font-bold text-[#17231B] text-sm">Belum Ada Data Summary</p>
              <p className="mt-1">Silakan upload data transaksi Excel terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-3 py-3">PG</th>
                    <th className="px-3 py-3">Wilayah</th>
                    <th className="px-3 py-3">Periode</th>
                    <th className="px-4 py-3 text-right">Biaya Material</th>
                    <th className="px-4 py-3 text-right">Biaya Upah</th>
                    <th className="px-4 py-3 text-right">Batang Bibit</th>
                    <th className="px-4 py-3 text-right">Jumlah TK</th>
                    <th className="px-4 py-3 text-right">Luas (HA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {summaryList.map((row) => (
                    <tr key={row.kode} className="hover:bg-[#F7F9F7] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#16823B]">{row.kode}</td>
                      <td className="px-3 py-3">{row.pg}</td>
                      <td className="px-3 py-3">{row.wilayah}</td>
                      <td className="px-3 py-3">
                        {row.year}-{String(row.month).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.material)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.upah)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(row.batang, 0)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(row.jumlahTk, 1)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(row.luas, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          transactions.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5F6B63]">
              <FileSpreadsheet className="w-10 h-10 text-[#CBE0D1] mx-auto mb-2" />
              <p className="font-bold text-[#17231B] text-sm">Belum Ada Data Transaksi</p>
              <p className="mt-1">Silakan upload data transaksi Excel terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F7] text-[#5F6B63] font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-3 py-3">Tgl Realisasi</th>
                    <th className="px-3 py-3">SPK ID</th>
                    <th className="px-3 py-3">Wilayah</th>
                    <th className="px-3 py-3">Lokasi</th>
                    <th className="px-3 py-3">Jenis Data</th>
                    <th className="px-3 py-3">Jenis</th>
                    <th className="px-4 py-3 text-right">Biaya</th>
                    <th className="px-3 py-3 text-right">Resource</th>
                    <th className="px-3 py-3 text-right">Hasil (HA)</th>
                    <th className="px-4 py-3">Kode Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {transactions.map((tx) => (
                    <tr key={String(tx.idSulam)} className="hover:bg-[#F7F9F7] transition-colors">
                      <td className="px-4 py-3 font-mono text-[#5F6B63]">#{String(tx.idSulam)}</td>
                      <td className="px-3 py-3">
                        {new Date(tx.tanggalRealisasi).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-3 font-mono">{tx.spkId || "-"}</td>
                      <td className="px-3 py-3">{tx.wilayah}</td>
                      <td className="px-3 py-3">{tx.lokasi || "-"}</td>
                      <td className="px-3 py-3">{tx.jenisData}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.jenis === "Material"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {tx.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(tx.totalRealisasiBiaya || 0)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        {formatNumber(tx.resourceBahanAlat || 0, 1)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        {formatNumber(tx.hasilEfektif || 0, 2)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#5F6B63]">{tx.kode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
