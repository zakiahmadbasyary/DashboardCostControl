"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Code2,
  Layers,
  Sparkles,
  Zap,
  Table as TableIcon,
  Search,
} from "lucide-react";

export default function DatabaseTesterView() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [activeTableTab, setActiveTableTab] = useState<
    "lokasiHpp" | "masterSheet" | "budget" | "aktivitasHpp" | "rawJson"
  >("lokasiHpp");
  const [tableSearch, setTableSearch] = useState<string>("");

  const fetchDbStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-db");
      const data = await res.json();
      setDbData(data);
    } catch (err: any) {
      setDbData({
        status: "error",
        connected: false,
        error: err.message || "Gagal menghubungi API test-db",
        counts: { masterSheet: 0, budget: 0, lokasiHpp: 0, aktivitasHpp: 0, totalRecords: 0 },
        tables: { masterSheet: [], budget: [], lokasiHpp: [], aktivitasHpp: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/hpp/seed", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setSeedMessage("✅ " + data.message);
        await fetchDbStatus();
      } else {
        setSeedMessage("❌ " + (data.message || "Gagal melakukan seeding"));
      }
    } catch (err: any) {
      setSeedMessage("❌ Error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const formatCurrency = (val: any) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const isConnected = dbData?.connected === true;

  // Selected sample table rows for rendering
  const getSelectedTableRows = () => {
    if (!dbData || !dbData.tables) return [];
    switch (activeTableTab) {
      case "lokasiHpp":
        return dbData.tables.lokasiHpp || [];
      case "masterSheet":
        return dbData.tables.masterSheet || [];
      case "budget":
        return dbData.tables.budget || [];
      case "aktivitasHpp":
        return dbData.tables.aktivitasHpp || [];
      default:
        return [];
    }
  };

  const rawRows = getSelectedTableRows();
  const filteredRows = rawRows.filter((row: any) => {
    if (!tableSearch) return true;
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(tableSearch.toLowerCase());
  });

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* 1. Header Banner & Diagnostics Control Bar */}
      <div className="bg-gradient-to-r from-[#17231B] via-[#1C3324] to-[#16823B] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Database Testing Suite • HPP PostgreSQL Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Penguji & Penguji Database Dashboard HPP
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Modul pengujian integrasi database PostgreSQL untuk menguji status koneksi, response latency, jumlah baris tabel (MasterSheet, Budget, LokasiHPP, AktivitasHPP), serta eksekusi data simulasi (seeding).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchDbStatus}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Tes Ulang Koneksi</span>
            </button>

            <button
              onClick={handleRunSeed}
              disabled={seeding || loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
              <span>{seeding ? "Mengisi Data..." : "Isi Data Simulasi (Seed)"}</span>
            </button>
          </div>

        </div>

        {/* Seed Feedback Message Alert */}
        {seedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-white/15 border border-white/20 text-xs font-semibold backdrop-blur-xs animate-fadeIn">
            {seedMessage}
          </div>
        )}
      </div>

      {/* 2. Connection Status & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status Koneksi */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5F6B63]">
            <span className="text-xs font-bold uppercase tracking-wider">Status Database</span>
            <Server className="w-4 h-4 text-[#16823B]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Terhubung</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>Terputus</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[11px] text-[#5F6B63] font-medium flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Provider: PostgreSQL</span>
            <span>Schema: <strong className="text-emerald-700">hpp</strong></span>
          </div>
        </div>

        {/* Query Latency */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5F6B63]">
            <span className="text-xs font-bold uppercase tracking-wider">Response Latency</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl font-black text-[#17231B] tracking-tight">
            {loading ? "..." : `${dbData?.latencyMs ?? 0} ms`}
          </div>
          <div className="mt-2 text-[11px] text-[#5F6B63] font-medium flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Client: Prisma v6.19</span>
            <span className="text-emerald-700 font-semibold">Sangat Cepat</span>
          </div>
        </div>

        {/* Total Row Count */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5F6B63]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Record DB</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl font-black text-[#17231B] tracking-tight">
            {loading ? "..." : `${dbData?.counts?.totalRecords ?? 0} Baris`}
          </div>
          <div className="mt-2 text-[11px] text-[#5F6B63] font-medium flex items-center justify-between pt-2 border-t border-gray-100">
            <span>4 Tabel HPP</span>
            <span className="text-amber-700 font-semibold">Aktif</span>
          </div>
        </div>

        {/* Database URL & Target */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5F6B63]">
            <span className="text-xs font-bold uppercase tracking-wider">Target Connection</span>
            <Code2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3 text-xs font-mono font-bold text-[#17231B] truncate bg-gray-50 p-1.5 rounded border border-gray-200">
            {dbData?.databaseInfo?.maskedUrl || "localhost:5432/cost_control_db"}
          </div>
          <div className="mt-2 text-[11px] text-[#5F6B63] font-medium flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Status API: {dbData?.status || "OK"}</span>
            <span className="font-mono text-[10px]">localhost:3002</span>
          </div>
        </div>

      </div>

      {/* 3. Table Counts Summary Cards */}
      <div className="bg-white rounded-2xl border border-[#E0E8E2] p-5 shadow-2xs">
        <h3 className="font-extrabold text-[#17231B] text-base mb-4 flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-[#16823B]" />
          <span>Statistik Jumlah Record per Tabel HPP</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#EAEFEB] flex flex-col">
            <span className="text-[11px] font-bold text-[#5F6B63] uppercase">MasterSheet</span>
            <span className="text-xl font-black text-[#17231B] mt-1">{dbData?.counts?.masterSheet ?? 0}</span>
            <span className="text-[10px] text-[#5F6B63] mt-1">Bibit, Lokasi & Wilayah</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#EAEFEB] flex flex-col">
            <span className="text-[11px] font-bold text-[#5F6B63] uppercase">Budget</span>
            <span className="text-xl font-black text-[#17231B] mt-1">{dbData?.counts?.budget ?? 0}</span>
            <span className="text-[10px] text-[#5F6B63] mt-1">Anggaran HPP Group</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#EAEFEB] flex flex-col">
            <span className="text-[11px] font-bold text-[#5F6B63] uppercase">LokasiHPP</span>
            <span className="text-xl font-black text-[#17231B] mt-1">{dbData?.counts?.lokasiHpp ?? 0}</span>
            <span className="text-[10px] text-[#5F6B63] mt-1">Realisasi Biaya per Lokasi</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#EAEFEB] flex flex-col">
            <span className="text-[11px] font-bold text-[#5F6B63] uppercase">AktivitasHPP</span>
            <span className="text-xl font-black text-[#17231B] mt-1">{dbData?.counts?.aktivitasHpp ?? 0}</span>
            <span className="text-[10px] text-[#5F6B63] mt-1">Catatan Pemeliharaan & Panen</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Data Inspector */}
      <div className="bg-white rounded-2xl border border-[#E0E8E2] shadow-2xs overflow-hidden flex flex-col">
        {/* Inspector Header Tabs */}
        <div className="p-4 border-b border-[#EAEFEB] bg-[#F8FAF9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#E8EFEA] rounded-xl border border-[#D5E1D8]">
            <button
              onClick={() => setActiveTableTab("lokasiHpp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTableTab === "lokasiHpp"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              LokasiHPP ({dbData?.counts?.lokasiHpp ?? 0})
            </button>
            <button
              onClick={() => setActiveTableTab("masterSheet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTableTab === "masterSheet"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              MasterSheet ({dbData?.counts?.masterSheet ?? 0})
            </button>
            <button
              onClick={() => setActiveTableTab("budget")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTableTab === "budget"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              Budget ({dbData?.counts?.budget ?? 0})
            </button>
            <button
              onClick={() => setActiveTableTab("aktivitasHpp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTableTab === "aktivitasHpp"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              AktivitasHPP ({dbData?.counts?.aktivitasHpp ?? 0})
            </button>
            <button
              onClick={() => setActiveTableTab("rawJson")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTableTab === "rawJson"
                  ? "bg-gray-800 text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              JSON Raw Response
            </button>
          </div>

          {/* Table Search Filter */}
          {activeTableTab !== "rawJson" && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#8C9890] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter data dalam tabel..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DDE5DF] rounded-xl text-xs font-medium text-[#17231B] focus:outline-none focus:border-[#16823B]"
              />
            </div>
          )}

        </div>

        {/* Inspector Content */}
        <div className="p-4">
          {activeTableTab === "rawJson" ? (
            <pre className="bg-[#17231B] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {JSON.stringify(dbData, null, 2)}
            </pre>
          ) : filteredRows.length === 0 ? (
            <div className="py-12 text-center text-[#8C9890] font-medium text-xs">
              Belum ada baris data pada tabel {activeTableTab}. Klik tombol <strong className="text-[#16823B]">"Isi Data Simulasi (Seed)"</strong> untuk mengisi data ke database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F4F1] text-[#455248] font-bold uppercase tracking-wider border-b border-[#E0E8E2]">
                    {Object.keys(filteredRows[0] || {}).map((key) => (
                      <th key={key} className="py-2.5 px-3 whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFEB]">
                  {filteredRows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#F4F8F5] transition-colors font-mono text-[11px]">
                      {Object.entries(row).map(([k, v]: [string, any], vIdx) => (
                        <td key={vIdx} className="py-2.5 px-3 whitespace-nowrap text-[#2C3830]">
                          {typeof v === "object" && v !== null
                            ? JSON.stringify(v)
                            : k.toLowerCase().includes("biaya") || k.toLowerCase().includes("budget")
                            ? formatCurrency(v)
                            : String(v ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8FAF9] border-t border-[#EAEFEB] text-xs text-[#5F6B63] flex justify-between items-center">
          <span>Menampilkan sampel data dari PostgreSQL Database</span>
          <span className="font-semibold text-emerald-800">Prisma Engine OK</span>
        </div>
      </div>
    </div>
  );
}
