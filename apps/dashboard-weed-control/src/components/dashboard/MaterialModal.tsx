"use client";

import React, { useEffect, useState } from "react";
import { MaterialItem } from "@/types/dashboard";
import { weedDashboardService, MaterialDetailResponse } from "@/services/weedDashboardService";
import { X, FlaskConical, AlertCircle, FileSpreadsheet } from "lucide-react";
import { formatCurrencyRp, formatDateShort } from "@/lib/formatters";

interface MaterialModalProps {
  timelineId: string | null;
  onClose: () => void;
}

export default function MaterialModal({
  timelineId,
  onClose,
}: MaterialModalProps) {
  const [data, setData] = useState<MaterialDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!timelineId) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    weedDashboardService
      .getMaterials(timelineId)
      .then((res) => {
        if (isMounted) {
          setData(res);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Gagal memuat rincian bahan material");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [timelineId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!timelineId) return null;

  const timelineInfo = data?.timeline;
  // Filter hanya material yang memiliki nilai (> 0, bukan 0, bukan null, bukan "-")
  const materials = (data?.materials || []).filter((mat) => {
    if (mat.quantity === null || mat.quantity === undefined) return false;
    const val = typeof mat.quantity === "number" ? mat.quantity : parseFloat(String(mat.quantity));
    return !isNaN(val) && val > 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DDE5DF] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#16823B] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Rincian Bahan Material
              </h3>
              <p className="text-xs text-emerald-100">
                {timelineInfo ? (
                  <>
                    {timelineInfo.aktivitas} • {timelineInfo.lokasi} (
                    {formatDateShort(timelineInfo.tanggalRealisasi)})
                  </>
                ) : (
                  "Memuat detail transaksi..."
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#5F6B63]">
                Memuat rincian bahan material...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
              <p className="text-xs text-[#5F6B63]">
                Tidak ada data bahan material dengan nilai tercatat untuk transaksi ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Total Material Cost Summary */}
              {timelineInfo?.totalMaterialCost !== null &&
                timelineInfo?.totalMaterialCost !== undefined && (
                  <div className="p-3 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#16823B]">Total Biaya Material:</span>
                    <span className="font-mono font-extrabold text-[#17231B] text-sm">
                      {formatCurrencyRp(timelineInfo.totalMaterialCost)}
                    </span>
                  </div>
                )}

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">Nama Material</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60">
                    {materials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-[#F7F9F7] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#17231B]">
                          {mat.namaMaterial}
                        </td>
                        {/* Quantity: 2 decimals, 0 is displayed, tooltip raw value */}
                        <td
                          className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]"
                          title={`Nilai asli: ${mat.quantity}`}
                        >
                          {new Intl.NumberFormat("id-ID", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(mat.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-[#89938D] text-right">
                Menampilkan {materials.length} material yang diaplikasikan
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F7F9F7] border-t border-[#DDE5DF] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#DDE5DF] hover:bg-[#EAEFEB] text-xs font-bold text-[#17231B] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

