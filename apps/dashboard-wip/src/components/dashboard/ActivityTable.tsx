"use client";

import { ActivityData, GroupCostData, LocationData } from "@/types/dashboard";
import { ListChecks, AlertCircle } from "lucide-react";

interface ActivityTableProps {
  selectedGroupCost: GroupCostData | null;
  selectedLocation?: LocationData | null;
  activities: ActivityData[];
  loading?: boolean;
}

export default function ActivityTable({
  selectedGroupCost,
  selectedLocation,
  activities,
  loading,
}: ActivityTableProps) {
  if (!selectedGroupCost) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Aktivitas Belum Dipilih</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs">
          Silakan pilih salah satu <strong>Group Cost</strong> di samping untuk melihat rincian aktivitas pekerjaan.
        </p>
      </div>
    );
  }

  const totalCostHa = activities.reduce((acc, curr) => acc + curr.costHa, 0);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17231B]">Aktivitas Lapangan</h3>
              <p className="text-xs text-[#5F6B63]">
                Rincian pekerjaan untuk Group Cost <span className="font-bold text-[#16823B]">{selectedGroupCost.groupCost}</span>
                {selectedLocation && (
                  <> di Lokasi <span className="font-bold text-[#16823B]">{selectedLocation.lokasi}</span></>
                )}{" "}
                (Cost/Ha dalam Rp = Cost ÷ Luas)
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat aktivitas...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <p className="text-xs text-[#5F6B63]">
              Tidak ada rincian aktivitas untuk Group Cost <strong>{selectedGroupCost.groupCost}</strong>
              {selectedLocation ? ` di lokasi ${selectedLocation.lokasi}` : ""}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Aktivitas</th>
                  <th className="py-2.5 px-3 text-right">Luas (Ha)</th>
                  <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                {[...activities]
                  .sort((a, b) => b.costHa - a.costHa)
                  .map((item) => (
                    <tr key={item.idAktivitas} className="hover:bg-[#F7F9F7] transition-colors">
                      <td className="py-2.5 px-3 font-medium">{item.aktivitas}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                        {item.luas}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                        {item.costHa.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#DDE5DF] text-[11px] text-[#5F6B63] flex justify-between items-center">
        <span>Total {activities.length} aktivitas terdaftar</span>
        <span className="font-semibold text-[#17231B]">
          Total Cost / Ha (Rp): <span className="font-bold text-[#16823B]">{totalCostHa.toLocaleString("id-ID")}</span>
        </span>
      </div>
    </div>
  );
}
