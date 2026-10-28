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
  const PAGE_SIZE = 8; // Maksimal 8 data per halaman sesuai instruksi

  // Reset halaman saat Cost Element atau Periode berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCe2, selectedPeriodLabel]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = data.slice(startIndex, startIndex + PAGE_SIZE);

  const getPaginationItems = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-3">
      {/* Subheader Tabel */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#17231B] leading-tight">
              Komparasi Cost Center
            </h4>
            <p className="text-[10px] text-[#5F6B63] line-clamp-1">
              Periode: <strong className="text-[#16823B]">{selectedPeriodLabel || "—"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#5F6B63]">
            <span className="w-2.5 h-2.5 rounded bg-[#FCE27A]/60 border border-[#ECC848] inline-block" />
            <span>Tertinggi</span>
          </div>
          <span className="text-[10px] font-semibold text-[#16823B] bg-[#EAF3EC] px-2 py-0.5 rounded-lg border border-[#CBE0D1]">
            {data.length} CC
          </span>
        </div>
      </div>

      {/* Konten Tabel Tunggal (8 Data) */}
      {loading ? (
        <div className="h-[340px] flex flex-col justify-center items-center rounded-xl border border-[#DDE5DF] bg-[#F8FAF9]/50">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat data komparasi...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[340px] flex flex-col justify-center items-center p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF] text-xs text-[#5F6B63]">
          Tidak ada data transaksi perbandingan antar PG pada periode ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
              <tr className="h-[34px]">
                <th className="py-2 px-3">Cost Center</th>
                <th className="py-2 px-3 text-right text-[#16823B]">PG1 (Rp)</th>
                <th className="py-2 px-3 text-right text-[#29A9D6]">PG2 (Rp)</th>
                <th className="py-2 px-3 text-right text-[#A68817]">PG3 (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]">
              {paginatedData.map((row) => {
                const valPg1 = row.pg1 ?? 0;
                const valPg2 = row.pg2 ?? 0;
                const valPg3 = row.pg3 ?? 0;
                const maxVal = Math.max(valPg1, valPg2, valPg3);

                const isPg1Highest = maxVal > 0 && row.pg1 !== null && row.pg1 === maxVal;
                const isPg2Highest = maxVal > 0 && row.pg2 !== null && row.pg2 === maxVal;
                const isPg3Highest = maxVal > 0 && row.pg3 !== null && row.pg3 === maxVal;

                return (
                  <tr key={row.costcenter} className="h-[38px] hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-1.5 px-3">
                      <span
                        className="font-bold text-[11px] text-[#17231B] block line-clamp-1 max-w-[140px] sm:max-w-[170px]"
                        title={`${row.costcenter} - ${row.deskripsiCostcenter}`}
                      >
                        {row.deskripsiCostcenter || row.costcenter}
                      </span>
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right font-mono text-[11px] whitespace-nowrap ${
                        isPg1Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg1 !== null && row.pg1 !== 0 ? row.pg1.toLocaleString("id-ID") : "-"}
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right font-mono text-[11px] whitespace-nowrap ${
                        isPg2Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg2 !== null && row.pg2 !== 0 ? row.pg2.toLocaleString("id-ID") : "-"}
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right font-mono text-[11px] whitespace-nowrap ${
                        isPg3Highest ? "bg-[#FCE27A]/35 text-[#17231B] font-semibold" : "text-[#17231B]"
                      }`}
                    >
                      {row.pg3 !== null && row.pg3 !== 0 ? row.pg3.toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                );
              })}

              {/* Filler Rows agar tinggi tabel selalu fix setara 8 data */}
              {Array.from({ length: Math.max(0, PAGE_SIZE - paginatedData.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-[38px] pointer-events-none select-none border-b border-[#DDE5DF]/20">
                  <td className="py-1.5 px-3">&nbsp;</td>
                  <td className="py-1.5 px-3">&nbsp;</td>
                  <td className="py-1.5 px-3">&nbsp;</td>
                  <td className="py-1.5 px-3">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bar Kontrol Navigasi Pagination */}
      {!loading && data.length > 0 && (
        <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between text-xs min-h-[38px]">
          <div className="text-[11px] text-[#5F6B63]">
            <strong className="text-[#17231B]">{startIndex + 1}</strong>–
            <strong className="text-[#17231B]">{Math.min(startIndex + PAGE_SIZE, data.length)}</strong> dari{" "}
            <strong className="text-[#17231B]">{data.length}</strong> CC
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center p-1 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                {getPaginationItems().map((item, idx) =>
                  typeof item === "number" ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === item
                          ? "bg-[#16823B] text-white shadow-xs"
                          : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={idx} className="px-0.5 text-[10px] text-[#89938D]">
                      {item}
                    </span>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center p-1 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
