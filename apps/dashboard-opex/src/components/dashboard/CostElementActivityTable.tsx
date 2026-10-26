"use client";

import React from "react";
import { ActivityGroupItem } from "@/types/opex";
import { ListChecks, AlertCircle, Receipt } from "lucide-react";

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
                  <th className="py-2.5 px-3 text-center">Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {activities.map((act, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#17231B]">
                        {act.activity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#5F6B63]">
                      <span className="px-2 py-0.5 rounded-full bg-[#F8FAF9] border border-[#DDE5DF] text-[10px] font-bold">
                        {act.count}×
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
