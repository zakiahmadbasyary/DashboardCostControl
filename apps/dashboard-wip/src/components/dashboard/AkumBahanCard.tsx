"use client";

import { useState } from "react";
import { AkumBahanData, LocationData } from "@/types/dashboard";
import { Package, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface AkumBahanCardProps {
  selectedLocation: LocationData | null;
  data: AkumBahanData[];
  loading?: boolean;
}

export default function AkumBahanCard({ selectedLocation, data, loading }: AkumBahanCardProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerTable = 10;
  const itemsPerPage = itemsPerTable * 3; // 30 items per page (10 per table)
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;

  if (!selectedLocation) {
    return null;
  }

  // Slice data for current page
  const pageStartIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = data.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  // Divide into 3 chunks for 3 tables
  const table1Data = currentPageData.slice(0, itemsPerTable);
  const table2Data = currentPageData.slice(itemsPerTable, itemsPerTable * 2);
  const table3Data = currentPageData.slice(itemsPerTable * 2, itemsPerTable * 3);

  const tableChunks = [
    { label: "Bagian 1", items: table1Data, offset: pageStartIndex },
    { label: "Bagian 2", items: table2Data, offset: pageStartIndex + itemsPerTable },
    { label: "Bagian 3", items: table3Data, offset: pageStartIndex + itemsPerTable * 2 },
  ];

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#17231B] flex items-center gap-2">
              <span>Akumulasi Bahan</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] font-extrabold">
                Blok {selectedLocation.lokasi}
              </span>
            </h3>
            <p className="text-[11px] text-[#5F6B63]">
              Daftar seluruh akumulasi pemakaian material dan bahan baku yang digunakan pada lokasi ini.
            </p>
          </div>
        </div>

        {/* Counter & Pagination Header */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl text-[#16823B]">
            Total {data.length} Material
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl p-1 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg hover:bg-white text-[#17231B] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-bold text-[10px] text-[#17231B] whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg hover:bg-white text-[#17231B] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat data akumulasi bahan...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <AlertCircle className="w-5 h-5 text-[#89938D] mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-[#5F6B63]">Tidak ada data akumulasi bahan</p>
          <p className="text-[10px] text-[#89938D] mt-0.5">
            Belum ada catatan pemakaian material untuk blok lokasi {selectedLocation.lokasi}.
          </p>
        </div>
      ) : (
        /* 3 Tables Grid Side-by-Side */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tableChunks.map((chunk, chunkIdx) => (
            <div key={chunkIdx} className="overflow-hidden rounded-xl border border-[#DDE5DF] bg-white shadow-2xs flex flex-col justify-between">
              <div className="overflow-x-auto max-h-[360px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] shadow-2xs text-[10px]">
                    <tr>
                      <th className="py-2 px-2.5 w-8 text-center text-[#89938D] bg-[#F7F9F7]">No</th>
                      <th className="py-2 px-2.5 bg-[#F7F9F7]">Deskripsi Material</th>
                      <th className="py-2 px-2.5 text-right bg-[#F7F9F7]">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {chunk.items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-[#89938D] text-[11px] bg-[#F7F9F7]/30">
                          - Tidak ada data -
                        </td>
                      </tr>
                    ) : (
                      chunk.items.map((item, idx) => {
                        const globalNo = chunk.offset + idx + 1;
                        return (
                          <tr key={item.id || idx} className="hover:bg-[#16823B]/5 transition-colors">
                            <td className="py-1.5 px-2.5 text-center text-[10px] text-[#89938D] font-mono">
                              {globalNo}
                            </td>
                            <td className="py-1.5 px-2.5 font-medium text-[11px] max-w-[170px] truncate" title={item.deskripsiMaterial}>
                              {item.deskripsiMaterial || item.kodeMaterial || "-"}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#16823B] text-[11px] whitespace-nowrap">
                              {item.quantity && item.quantity > 0
                                ? item.quantity.toLocaleString("id-ID", { maximumFractionDigits: 2 })
                                : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

