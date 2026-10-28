"use client";

import React, { useState, useEffect } from "react";
import { TrendPgCostCenterItem } from "@/types/opex";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";

interface TrendPgTablesProps {
  data: TrendPgCostCenterItem[];
  selectedPeriodLabel?: string;
  selectedCe2: string;
  loading?: boolean;
}

export default function TrendPgTables({
  data,
  selectedPeriodLabel,
  selectedCe2,
  loading,
}: TrendPgTablesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20; // Maksimal 20 data per halaman (10 kiri, 10 kanan)
  const HALF_PAGE = 10;

  // Reset halaman saat Cost Element atau Periode berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCe2, selectedPeriodLabel]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageData = data.slice(startIndex, startIndex + PAGE_SIZE);

  const leftTable = pageData.slice(0, HALF_PAGE);
  const rightTable = pageData.slice(HALF_PAGE, PAGE_SIZE);

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const renderSingleTable = (items: TrendPgCostCenterItem[], partIndex: number) => {
    const partStart = startIndex + (partIndex === 1 ? 1 : HALF_PAGE + 1);
    const partEnd = startIndex + (partIndex === 1 ? items.length : HALF_PAGE + items.length);

    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#17231B]">
            {partIndex === 1 ? "Kolom Kiri" : "Kolom Kanan"}
          </span>
          <span className="text-[10px] text-[#5F6B63]">
            {items.length > 0 ? `${items.length} Data (${partStart}–${partEnd})` : "0 Data"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] min-h-[516px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
              <tr className="h-[36px]">
                <th className="py-2.5 px-3">Cost Center</th>
                <th className="py-2.5 px-3 text-right text-[#16823B]">PG1 (Rp)</th>
                <th className="py-2.5 px-3 text-right text-[#29A9D6]">PG2 (Rp)</th>
                <th className="py-2.5 px-3 text-right text-[#A68817]">PG3 (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]">
              {items.map((row) => {
                const valPg1 = row.pg1 ?? 0;
                const valPg2 = row.pg2 ?? 0;
                const valPg3 = row.pg3 ?? 0;
                const maxVal = Math.max(valPg1, valPg2, valPg3);

                const isPg1Highest = maxVal > 0 && row.pg1 !== null && row.pg1 === maxVal;
                const isPg2Highest = maxVal > 0 && row.pg2 !== null && row.pg2 === maxVal;
                const isPg3Highest = maxVal > 0 && row.pg3 !== null && row.pg3 === maxVal;

                return (
                  <tr key={row.costcenter} className="h-[48px] hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className="font-bold text-xs text-[#17231B] block line-clamp-1"
                        title={row.deskripsiCostcenter}
                      >
                        {row.deskripsiCostcenter}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono whitespace-nowrap ${
                        isPg1Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg1 !== null && row.pg1 !== 0 ? row.pg1.toLocaleString("id-ID") : "-"}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono whitespace-nowrap ${
                        isPg2Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg2 !== null && row.pg2 !== 0 ? row.pg2.toLocaleString("id-ID") : "-"}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono whitespace-nowrap ${
                        isPg3Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg3 !== null && row.pg3 !== 0 ? row.pg3.toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                );
              })}

              {/* Filler Rows agar tinggi tabel selalu persis setara 10 data */}
              {Array.from({ length: Math.max(0, HALF_PAGE - items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-[48px] pointer-events-none select-none border-b border-[#DDE5DF]/20">
                  <td className="py-2 px-3">&nbsp;</td>
                  <td className="py-2 px-3">&nbsp;</td>
                  <td className="py-2 px-3">&nbsp;</td>
                  <td className="py-2 px-3">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-extrabold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16823B]" />
          Tabel Komparasi Cost Center Antar PG — {selectedPeriodLabel} ({selectedCe2})
        </h3>
        <p className="text-xs text-[#5F6B63] mt-0.5">
          Perbandingan nilai Actual murni setiap Cost Center antara Plantation Group 1, 2, dan 3 pada periode dan Cost Element terpilih. Maksimal 20 data per halaman (10 kiri, 10 kanan).
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-8 text-center shadow-xs">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat tabel perbandingan antar PG...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 text-center text-xs text-[#89938D] shadow-xs">
          Tidak ada data transaksi perbandingan antar PG.
        </div>
      ) : (
        /* SATU CARD TUNGGAL UNTUK KEDUA TABEL & PAGINATION */
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDE5DF] gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#17231B]">
                  Actual per Cost Center Antar PG (PG1 vs PG2 vs PG3)
                </h4>
                <p className="text-[11px] text-[#5F6B63]">
                  Cost Element: <strong className="text-[#16823B]">{selectedCe2}</strong> · Periode: <strong className="text-[#16823B]">{selectedPeriodLabel}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-[#5F6B63]">
                <span className="w-3.5 h-3.5 rounded bg-[#FCE27A]/60 border border-[#ECC848] inline-block" />
                <span>Nilai Tertinggi</span>
              </div>
              <span className="text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] px-2.5 py-1 rounded-lg border border-[#CBE0D1]">
                Total {data.length} Cost Center
              </span>
            </div>
          </div>

          {/* Grid 2 Tabel: 10 Kiri & 10 Kanan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderSingleTable(leftTable, 1)}
            {renderSingleTable(rightTable, 2)}
          </div>

          {/* Bar Kontrol Navigasi Pagination di Bagian Bawah Card */}
          <div className="pt-3 border-t border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[44px]">
            <div className="text-xs text-[#5F6B63]">
              Menampilkan <strong className="text-[#17231B]">{data.length > 0 ? startIndex + 1 : 0}</strong>–
              <strong className="text-[#17231B]">{Math.min(startIndex + PAGE_SIZE, data.length)}</strong> dari{" "}
              <strong className="text-[#17231B]">{data.length}</strong> Cost Center
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationItems().map((item, idx) =>
                    typeof item === "number" ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === item
                            ? "bg-[#16823B] text-white shadow-xs"
                            : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-xs text-[#89938D]">
                        {item}
                      </span>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
