"use client";

import { GroupCostData, LocationData } from "@/types/dashboard";
import { Layers, CheckCircle2, AlertCircle } from "lucide-react";

interface GroupCostTableProps {
  selectedLocation: LocationData | null;
  groupCosts: GroupCostData[];
  selectedGroupCost: GroupCostData | null;
  onSelectGroupCost: (groupCost: GroupCostData) => void;
  loading?: boolean;
}

export default function GroupCostTable({
  selectedLocation,
  groupCosts,
  selectedGroupCost,
  onSelectGroupCost,
  loading,
}: GroupCostTableProps) {
  if (!selectedLocation) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Group Cost Belum Dipilih</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs">
          Silakan klik dan pilih salah satu baris lokasi pada tabel <strong>Analisis Lokasi</strong> di atas untuk melihat rincian Group Cost.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17231B]">Group Cost</h3>
              <p className="text-xs text-[#5F6B63]">
                Rincian biaya untuk Lokasi <span className="font-bold text-[#16823B]">{selectedLocation.lokasi}</span> ({selectedLocation.wilayah})
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat Group Cost...</p>
          </div>
        ) : groupCosts.length === 0 ? (
          <div className="p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <p className="text-xs text-[#5F6B63]">Tidak ada data Group Cost untuk lokasi ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Group Cost</th>
                  <th className="py-2.5 px-3 text-right">Cost / Ha</th>
                  <th className="py-2.5 px-3 text-right">SBT</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {groupCosts.map((item) => {
                  const isSelected = selectedGroupCost?.groupCost === item.groupCost;
                  const isOverSbt = item.costHa > item.sbt;
                  return (
                    <tr
                      key={item.groupCost}
                      onClick={() => onSelectGroupCost(item)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-semibold text-[#0B6B32]"
                          : "hover:bg-[#F7F9F7] text-[#17231B]"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold">{item.groupCost}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        Rp {item.costHa.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                        Rp {item.sbt.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        ) : isOverSbt ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#F9A91B]/15 text-[#F9A91B] border border-[#F9A91B]/30 text-[10px] font-semibold">
                            Over SBT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] border border-[#16823B]/20 text-[10px] font-semibold">
                            Under SBT
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#DDE5DF] text-[11px] text-[#5F6B63] flex justify-between items-center">
        <span>* SBT = Standar Biaya Tanaman</span>
        {selectedGroupCost && <span className="font-semibold text-[#16823B]">Klik Group Cost lain untuk mengubah aktivitas</span>}
      </div>
    </div>
  );
}
