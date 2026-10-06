"use client";

import { useState, useEffect } from "react";
import { Eye, Search, RefreshCw, AlertCircle, Database, FileText } from "lucide-react";

interface MasterSheetRecord {
  material: string;
  materialDescription: string | null;
  group: string | null;
  baseUnitOfMeasure: string | null;
  abcIndicator: string | null;
}

interface BahanMaterialRecord {
  id: string;
  material: string;
  price: number | null;
  currency: string | null;
  priceUnit: number | null;
  materialGroup: string | null;
  plant: string | null;
  purchasingGroup: string | null;
  lastChange: string | null;
  createdBy: string | null;
  update: string | null;
  nilai: number | null;
}

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<"mastersheet" | "bahan_material">("mastersheet");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [masterData, setMasterData] = useState<MasterSheetRecord[]>([]);
  const [bahanData, setBahanData] = useState<BahanMaterialRecord[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    try {
      const res = await fetch(`/api/admin/preview?tab=${activeTab}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat data preview.");
      }

      if (activeTab === "mastersheet") {
        setMasterData(data.data || []);
      } else {
        setBahanData(data.data || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      const elapsed = Date.now() - startTime;
      const minLoadingMs = 1000;
      if (elapsed < minLoadingMs) {
        await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab]);

  const filteredMaster = masterData.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.material.toLowerCase().includes(term) ||
      (r.materialDescription && r.materialDescription.toLowerCase().includes(term)) ||
      (r.group && r.group.toLowerCase().includes(term))
    );
  });

  const filteredBahan = bahanData.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.material.toLowerCase().includes(term) ||
      (r.materialGroup && r.materialGroup.toLowerCase().includes(term)) ||
      (r.plant && r.plant.toLowerCase().includes(term))
    );
  });

  const activeFiltered = activeTab === "mastersheet" ? filteredMaster : filteredBahan;
  const totalPages = Math.max(1, Math.ceil(activeFiltered.length / itemsPerPage));
  const paginatedData = activeFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatNumber = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(val);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data Database</h1>
          <p className="text-xs text-[#5F6B63] mt-1">
            Inspeksi data aktual yang tersimpan dalam tabel database PostgreSQL untuk MasterSheet & BahanMaterial.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DDE5DF] text-[#17231B] hover:bg-[#F7F9F7] font-semibold text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
          suppressHydrationWarning
        >
          <RefreshCw className={`w-4 h-4 text-[#16823B] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs & Search Input Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#EAF3EC] p-1.5 rounded-xl border border-[#CBE0D1]">
          <button
            onClick={() => setActiveTab("mastersheet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "mastersheet"
                ? "bg-[#16823B] text-white shadow-2xs"
                : "text-[#2C3830] hover:text-[#16823B]"
            }`}
            suppressHydrationWarning
          >
            <Database className="w-4 h-4" />
            <span>MasterSheet ({masterData.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("bahan_material")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "bahan_material"
                ? "bg-[#16823B] text-white shadow-2xs"
                : "text-[#2C3830] hover:text-[#16823B]"
            }`}
            suppressHydrationWarning
          >
            <FileText className="w-4 h-4" />
            <span>BahanMaterial ({bahanData.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan kode material / deskripsi / group..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-20 text-center text-[#5F6B63] space-y-3 bg-white rounded-2xl border border-[#DDE5DF]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#16823B]" />
          <p className="text-xs font-bold">Memuat data dari database PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center bg-red-50 border border-red-200 rounded-2xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-xs font-bold text-red-700">Gagal memuat data preview.</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      ) : activeFiltered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#DDE5DF] text-[#5F6B63] space-y-2">
          <Database className="w-8 h-8 mx-auto text-[#89938D]" />
          <p className="text-sm font-bold text-[#17231B]">Tidak ada data ditemukan</p>
          <p className="text-xs">Silakan unggah file Excel/CSV melalui menu Upload Data.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-xs space-y-3 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9F7] border-b border-[#DDE5DF] text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider">
                  {activeTab === "mastersheet" ? (
                    <>
                      <th className="py-3 px-4">Material Code</th>
                      <th className="py-3 px-4">Material Description</th>
                      <th className="py-3 px-4">Group</th>
                      <th className="py-3 px-4">Satuan (UoM)</th>
                      <th className="py-3 px-4">ABC Indicator</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Material Code</th>
                      <th className="py-3 px-4">Material Group</th>
                      <th className="py-3 px-4 text-right">Harga (Price)</th>
                      <th className="py-3 px-4">Currency</th>
                      <th className="py-3 px-4 text-right">Price Unit</th>
                      <th className="py-3 px-4 text-right">Nilai (Calculated)</th>
                      <th className="py-3 px-4">Plant</th>
                      <th className="py-3 px-4">Purchasing Group</th>
                      <th className="py-3 px-4 text-right">Last Change</th>
                      <th className="py-3 px-4">Created By</th>
                      <th className="py-3 px-4 text-right">Tanggal Update</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEF] text-xs font-medium text-[#17231B]">
                {activeTab === "mastersheet"
                  ? (paginatedData as MasterSheetRecord[]).map((row) => (
                      <tr key={row.material} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#16823B]">{row.material}</td>
                        <td className="py-3 px-4">{row.materialDescription || "-"}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#16823B] font-bold text-[10px]">
                            {row.group || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">{row.baseUnitOfMeasure || "-"}</td>
                        <td className="py-3 px-4">{row.abcIndicator || "-"}</td>
                      </tr>
                    ))
                  : (paginatedData as BahanMaterialRecord[]).map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#16823B]">{row.material}</td>
                        <td className="py-3 px-4">{row.materialGroup || "-"}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">{formatNumber(row.price)}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{row.currency || "IDR"}</td>
                        <td className="py-3 px-4 text-right font-mono text-[11px]">{formatNumber(row.priceUnit)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#16823B]">{formatNumber(row.nilai)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#17231B]">{row.plant || "-"}</td>
                        <td className="py-3 px-4">{row.purchasingGroup || "-"}</td>
                        <td className="py-3 px-4 text-right text-[#5F6B63]">{formatDate(row.lastChange)}</td>
                        <td className="py-3 px-4">{row.createdBy || "-"}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#16823B]">{formatDate(row.update)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-[#DDE5DF] pt-3 px-2 text-xs text-[#5F6B63]">
            <span>
              Menampilkan {paginatedData.length} dari {activeFiltered.length} data
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] font-semibold disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-bold text-[#17231B]">
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] font-semibold disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
