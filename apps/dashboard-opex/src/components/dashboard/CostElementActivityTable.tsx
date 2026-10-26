"use client";

import React, { useState, useEffect } from "react";
import { ActivityGroupItem } from "@/types/opex";
import { ListChecks, AlertCircle, Receipt, ChevronLeft, ChevronRight } from "lucide-react";

interface CostElementActivityTableProps {
  selectedCostCenter: string | null;
  selectedCe2: string | null;
  activities: ActivityGroupItem[];
  totalCost: number;
  transactionCount: number;
  loading?: boolean;
}

export default function CostElementActivityTable({
  selectedCostCenter,
  selectedCe2,
  activities,
  totalCost,
  transactionCount,
  loading,
}: CostElementActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Reset page when cost center or ce2 changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCostCenter, selectedCe2]);

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedActivities = activities.slice(startIndex, startIndex + PAGE_SIZE);
  if (!selectedCostCenter) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full min-h-[340px] flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-2xl bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Aktivitas Menunggu Pilihan</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs leading-relaxed">
          Pilih <strong>Cost Center</strong> dan kemudian salah satu <strong>Cost Element (CE2)</strong> di sebelah kiri untuk melihat rincian aktivitas lapangan.
        </p>
      </div>
    );
  }

  if (!selectedCe2) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full min-h-[340px] flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Pilih Cost Element</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs leading-relaxed">
          Silakan klik salah satu akun pada tabel <strong>Cost Element (CE2)</strong> di samping untuk menelusuri pekerjaan/aktivitas riil dari dokumen transaksi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#17231B]">
                Aktivitas Riil Lapangan
              </h4>
              <p className="text-[11px] text-[#5F6B63]">
                Catatan transaksi untuk <strong className="text-[#16823B]">{selectedCostCenter}</strong> · <strong className="text-[#16823B]">{selectedCe2}</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] px-2 py-0.5 rounded-lg border border-[#CBE0D1]">
            {transactionCount} Dokumen
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat transaksi aktivitas...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF] text-xs text-[#5F6B63]">
            Tidak ada transaksi aktivitas untuk kombinasi Cost Center dan Cost Element ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Uraian Pekerjaan / Catatan Aktivitas</th>
                  <th className="py-2.5 px-3 text-right">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {paginatedActivities.map((act, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#17231B]">
                        {act.activity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B]">
                      {act.totalCost.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls (Maks 10 Data per Halaman) */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-[#DDE5DF]">
            <div className="text-[11px] text-[#5F6B63]">
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong>–
              <strong className="text-[#17231B]">{Math.min(startIndex + PAGE_SIZE, activities.length)}</strong> dari{" "}
              <strong className="text-[#17231B]">{activities.length}</strong> Aktivitas
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pgNum) => (
                  <button
                    key={pgNum}
                    type="button"
                    onClick={() => setCurrentPage(pgNum)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pgNum
                        ? "bg-[#16823B] text-white shadow-xs"
                        : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {pgNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Total Summary */}
      {!loading && activities.length > 0 && (
        <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between text-xs">
          <span className="font-bold text-[#5F6B63]">Total Biaya Aktivitas:</span>
          <span className="font-mono font-extrabold text-sm text-[#16823B]">
            Rp {totalCost.toLocaleString("id-ID")}
          </span>
        </div>
      )}
    </div>
  );
}
