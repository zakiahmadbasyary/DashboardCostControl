"use client";

import React, { useState } from "react";
import { CapexItem } from "@/types/capex";
import StatusBadge from "./StatusBadge";
import { getIoWbsMoDisplay, formatNumberId } from "@/lib/formatters";
import {
  FileSpreadsheet,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
} from "lucide-react";

interface CapexListCardProps {
  items: CapexItem[];
  selectedId: string | null;
  onSelect: (item: CapexItem) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ITEMS_PER_PAGE = 8;

export default function CapexListCard({
  items,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
}: CapexListCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");

  // Quick table-level filter (filtering the current main filtered list further)
  const filteredItems = items.filter((item) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase().trim();
    const ioWbsMo = getIoWbsMoDisplay(item).value.toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const status = (item.statusCapex || "").toLowerCase();
    const capexNo = (item.capexNo || "").toLowerCase();
    return (
      ioWbsMo.includes(q) ||
      desc.includes(q) ||
      status.includes(q) ||
      capexNo.includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div
      className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col font-sans h-full"
      suppressHydrationWarning
    >
      {/* ── CARD HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E8EFE9]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#17231B]">
                Daftar CAPEX
              </h3>
              <span className="text-[10px] bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] px-2 py-0.5 rounded-full font-bold">
                {items.length} Total
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B63]">
              Pilih salah satu baris untuk melihat detail & tracking
            </p>
          </div>
        </div>

        {/* Quick Search in List */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari dalam daftar..."
            value={tableSearch}
            onChange={(e) => {
              setTableSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
          />
        </div>
      </div>

      {/* ── TABLE CONTENT ── */}
      <div className="flex-1 overflow-x-auto my-3 min-h-[300px]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#16823B] animate-spin" />
            <p className="text-xs text-[#5F6B63] font-medium">Memuat data CAPEX...</p>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 p-4 bg-red-50/60 rounded-xl border border-red-200 text-center">
            <AlertCircle className="w-7 h-7 text-red-600" />
            <p className="text-xs font-bold text-red-700">{error}</p>
            <button
              onClick={onRetry}
              className="px-3.5 py-1.5 bg-[#16823B] hover:bg-[#126B30] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 text-[#89938D]">
            <Inbox className="w-8 h-8 text-[#DDE5DF] mb-1" />
            <p className="text-xs font-bold text-[#2C3830]">
              Tidak ada data CAPEX yang sesuai
            </p>
            <p className="text-[11px] text-[#5F6B63] max-w-xs">
              Coba ubah kombinasi filter atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E8EFE9] text-[#5F6B63]">
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider w-[120px]">
                  IO - WBS - MO
                </th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-center w-[120px]">
                  Status
                </th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-right w-[140px]">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F1]">
              {paginatedItems.map((item, idx) => {
                const isSelected = item.idTotal === selectedId;
                const ioDisplay = getIoWbsMoDisplay(item);

                return (
                  <tr
                    key={item.idTotal}
                    onClick={() => onSelect(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#EAF3EC] border-l-4 border-l-[#16823B] font-medium"
                        : idx % 2 === 0
                        ? "hover:bg-[#F8FAF9]"
                        : "bg-[#FAFCFB] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {/* 1. IO - WBS - MO */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            isSelected ? "text-[#16823B]" : "text-[#17231B]"
                          }`}
                        >
                          {ioDisplay.value}
                        </span>
                        {ioDisplay.type !== "NONE" && (
                          <span className="text-[9px] text-[#89938D]">
                            Tipe: {ioDisplay.type}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Deskripsi */}
                    <td className="py-3 px-3">
                      <div className="line-clamp-2 text-[#17231B] font-medium text-xs leading-snug">
                        {item.description || "—"}
                      </div>
                    </td>

                    {/* 3. Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={item.statusCapex} />
                    </td>

                    {/* 4. Price */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="font-bold text-[#17231B] text-xs font-mono">
                        {formatNumberId(item.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CARD FOOTER / PAGINATION ── */}
      {filteredItems.length > 0 && (
        <div className="pt-3 border-t border-[#E8EFE9] flex items-center justify-between text-xs text-[#5F6B63]">
          <span className="text-[11px]">
            Menampilkan{" "}
            <span className="font-bold text-[#17231B]">
              {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)}
            </span>{" "}
            dari <span className="font-bold text-[#17231B]">{filteredItems.length}</span> baris
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={effectivePage === 1}
              className="p-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-2 text-[#17231B]">
              {effectivePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={effectivePage === totalPages}
              className="p-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
