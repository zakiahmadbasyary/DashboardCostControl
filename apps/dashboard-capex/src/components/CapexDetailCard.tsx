"use client";

import React from "react";
import { CapexItem } from "@/types/capex";
import StatusBadge from "./StatusBadge";
import {
  getIoWbsMoDisplay,
  formatNumberId,
  calculateUnitPrice,
  formatDateIndo,
} from "@/lib/formatters";
import { getCostCenterLabel } from "@/lib/costCenters";
import {
  Info,
  Clock,
  ShoppingCart,
  Users,
  Hash,
  FileText,
  Inbox,
} from "lucide-react";

interface CapexDetailCardProps {
  selectedItem: CapexItem | null;
  loading?: boolean;
}

export default function CapexDetailCard({
  selectedItem,
  loading = false,
}: CapexDetailCardProps) {
  if (loading) {
    return (
      <div
        className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-center items-center h-full min-h-[450px]"
        suppressHydrationWarning
      >
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#5F6B63] font-medium">Memuat rincian informasi CAPEX...</p>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div
        className="bg-white border border-[#DDE5DF] rounded-2xl p-8 shadow-xs flex flex-col justify-center items-center h-full min-h-[450px] text-center"
        suppressHydrationWarning
      >
        <div className="p-4 rounded-2xl bg-[#F7F9F7] border border-[#DDE5DF] mb-3 text-[#89938D]">
          <Info className="w-8 h-8 text-[#16823B]" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B] mb-1">
          Tidak Ada CAPEX Terpilih
        </h4>
        <p className="text-xs text-[#5F6B63] max-w-sm">
          Pilih salah satu baris proyek CAPEX pada tabel di sebelah kiri untuk melihat rincian detail, informasi PO, dan tracking approver.
        </p>
      </div>
    );
  }

  const ioDisplay = getIoWbsMoDisplay(selectedItem);
  const unitPrice = calculateUnitPrice(selectedItem.amount, selectedItem.quantity);

  // Urutkan riwayat approval: prioritas nomor byte / step urutan -> fallback dateApprove -> null paling bawah
  const sortedCreatedList = React.useMemo(() => {
    if (!selectedItem?.createdList) return [];
    return [...selectedItem.createdList].sort((a, b) => {
      // 1. Prioritas utama: byte (no urut approver 1, 2, 3...)
      if (a.byte !== null && a.byte !== undefined && b.byte !== null && b.byte !== undefined) {
        if (a.byte !== b.byte) return a.byte - b.byte;
      } else if (a.byte !== null && a.byte !== undefined) {
        return -1;
      } else if (b.byte !== null && b.byte !== undefined) {
        return 1;
      }

      // 2. Fallback: urutkan tanggal approve paling awal (duluan) -> lebih baru -> yang null paling bawah
      if (a.dateApprove && b.dateApprove) {
        const timeA = new Date(a.dateApprove).getTime();
        const timeB = new Date(b.dateApprove).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return Number(a.idCreated || 0) - Number(b.idCreated || 0);
      }
      if (a.dateApprove && !b.dateApprove) return -1;
      if (!a.dateApprove && b.dateApprove) return 1;
      return Number(a.idCreated || 0) - Number(b.idCreated || 0);
    });
  }, [selectedItem?.createdList]);

  return (
    <div
      className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-5 font-sans h-full"
      suppressHydrationWarning
    >
      {/* ── CARD TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EFE9]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#17231B] truncate">
                Informasi CAPEX Terpilih
              </h3>
              <StatusBadge status={selectedItem.statusCapex} size="sm" />
            </div>
            <p className="text-[11px] text-[#5F6B63] truncate">
              Tahun {selectedItem.tahun || "—"}
              {ioDisplay.value !== "—" ? ` · ${ioDisplay.type}: ${ioDisplay.value}` : ""}
            </p>
          </div>
        </div>

        {selectedItem.capexNo && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl self-start sm:self-auto shrink-0 shadow-2xs">
            <Hash className="w-3.5 h-3.5 text-[#16823B]" />
            <span className="font-mono text-xs font-bold text-[#17231B]">
              {selectedItem.capexNo}
            </span>
          </div>
        )}
      </div>

      {/* ── DETAIL CAPEX (LAYOUT REFERENSI DENGAN IO-WBS-MO) ── */}
      <div className="space-y-3 font-sans">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
              DETAIL CAPEX
            </h4>
            
          </div>
          <div className="flex items-center gap-1.5">
            {selectedItem.kategori && (
              <span className="text-[10px] font-medium text-[#16823B] bg-[#EAF3EC] border border-[#CBE0D1] px-2 py-0.5 rounded-md">
              {selectedItem.kategori}
              </span>
            )}
            {selectedItem.komoditi && (
              <span className="text-[10px] font-medium text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-2 py-0.5 rounded-md">
              {selectedItem.komoditi}
              </span>
            )}
            {ioDisplay.value !== "—" && (
              <span className="text-[10px] font-mono font-medium text-[#16823B] bg-[#EAF3EC] border border-[#CBE0D1] px-2 py-0.5 rounded-md">
              {ioDisplay.value}
              </span>
            )}
          </div>
        </div>

        {/* 1. Box: Capex item Descriptions */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-[#16823B] px-3 py-1.5 text-center">
            <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide">
              Capex item Descriptions
            </span>
          </div>
          <div className="bg-white px-3 py-2.5 text-center">
            <p className="text-xs sm:text-[13px] font-medium text-[#17231B] leading-relaxed">
              {selectedItem.description || "—"}
            </p>
          </div>
        </div>

        {/* 2. Table: No Capex | IO - WBS - MO | Unit Price | Qty | Total Price */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-5 bg-[#16823B] divide-x divide-white/20 text-center py-1.5 px-1">
                <div className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide px-1">
                  No Capex
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide px-1">
                  IO - WBS - MO
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide px-1">
                  Unit Price
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide px-1">
                  Qty
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide px-1">
                  Total Price
                </div>
              </div>
              <div className="grid grid-cols-5 bg-white divide-x divide-[#E8EFE9] text-center py-2.5 px-1 items-center">
                <div
                  className="font-mono text-[11px] sm:text-xs font-medium text-[#17231B] px-1 truncate"
                  title={selectedItem.capexNo || undefined}
                >
                  {selectedItem.capexNo || <span className="text-[#89938D] font-normal italic">—</span>}
                </div>
                <div
                  className="font-mono text-[11px] sm:text-xs font-medium text-[#16823B] px-1 truncate"
                  title={`${ioDisplay.value}${ioDisplay.type !== "NONE" ? ` (${ioDisplay.type})` : ""}`}
                >
                  {ioDisplay.value}
                </div>
                <div
                  className="font-mono text-[11px] sm:text-xs font-medium text-[#17231B] px-1 truncate"
                  title={unitPrice.raw != null ? formatNumberId(unitPrice.raw) : undefined}
                >
                  {unitPrice.raw != null ? formatNumberId(unitPrice.raw) : "—"}
                </div>
                <div className="font-mono text-[11px] sm:text-xs font-medium text-[#17231B] px-1">
                  {selectedItem.quantity != null
                    ? new Intl.NumberFormat("id-ID").format(selectedItem.quantity)
                    : "—"}
                </div>
                <div
                  className="font-mono text-[11px] sm:text-xs font-semibold text-[#16823B] px-1 truncate"
                  title={selectedItem.amount != null ? formatNumberId(selectedItem.amount) : undefined}
                >
                  {selectedItem.amount != null ? formatNumberId(selectedItem.amount) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BAGIAN B: TRACKING CAPEX ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#17231B] uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[#16823B]" />
          <span>Tracking CAPEX</span>
        </div>

        {/* ── TABEL 1: Informasi PR/PO/Purchasing ── */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-[#F8FAF9] px-3.5 py-2 border-b border-[#E8EFE9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span className="text-[11px] font-bold text-[#17231B]">
                Tabel 1 — Informasi PR / PO / Purchasing
              </span>
            </div>
            {selectedItem.po?.noPo ? (
              <span className="text-[9px] font-bold bg-[#F3EEFF] text-[#7c3aed] border border-[#D8C8FB] px-2 py-0.5 rounded-full">
                PO Terbit
              </span>
            ) : selectedItem.nomorPr ? (
              <span className="text-[9px] font-bold bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8] px-2 py-0.5 rounded-full">
                PR Diajukan
              </span>
            ) : (
              <span className="text-[9px] font-medium text-[#89938D]">
                Belum ada PR/PO
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[420px]">
              <thead>
                <tr className="bg-[#FAFCFB] text-[#5F6B63] border-b border-[#E8EFE9]">
                  <th className="py-2 px-3 font-semibold text-[10px] uppercase w-[120px]">
                    Cost Center
                  </th>
                  <th className="py-2 px-3 font-semibold text-[10px] uppercase w-[120px]">
                    No PR
                  </th>
                  <th className="py-2 px-3 font-semibold text-[10px] uppercase w-[120px]">
                    No PO
                  </th>
                  <th className="py-2 px-3 font-semibold text-[10px] uppercase">
                    Purchasing Group
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-[#F8FAF9] transition-colors">
                  {/* Cost Center */}
                  <td className="py-2.5 px-3 text-[11px] text-[#17231B]">
                    {selectedItem.costCenter ? (
                      <div>
                        <div className="font-semibold text-[#17231B]">
                          {getCostCenterLabel(selectedItem.costCenter)}
                        </div>
                        <div className="text-[10px] text-[#89938D] font-mono">
                          {selectedItem.costCenter}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* No PR */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {selectedItem.nomorPr ? (
                      <span className="font-bold text-[#7c3aed]">
                        {selectedItem.nomorPr}
                      </span>
                    ) : (
                      <span className="text-[#89938D] italic">—</span>
                    )}
                  </td>

                  {/* No PO */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {selectedItem.po?.noPo ? (
                      <span className="font-bold text-[#16823B]">
                        {selectedItem.po.noPo}
                      </span>
                    ) : (
                      <span className="text-[#89938D] italic">—</span>
                    )}
                  </td>

                  {/* Purchasing */}
                  <td className="py-2.5 px-3">
                    {selectedItem.po?.purchasing?.description ? (
                      <div>
                        <span className="font-semibold text-[#17231B] text-[11px]">
                          {selectedItem.po.purchasing.description}
                        </span>
                        {selectedItem.po.pgr && (
                          <span className="text-[10px] text-[#89938D] ml-1">
                            (PGR: {selectedItem.po.pgr})
                          </span>
                        )}
                      </div>
                    ) : selectedItem.po?.pgr ? (
                      <span className="text-[11px] text-[#5F6B63]">
                        PGR: {selectedItem.po.pgr}
                      </span>
                    ) : (
                      <span className="text-[#89938D] italic">—</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TABEL 2: Tracking Approver ── */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-[#F8FAF9] px-3.5 py-2 border-b border-[#E8EFE9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#16823B]" />
              <span className="text-[11px] font-bold text-[#17231B]">
                Tabel 2 — Tracking Approver
              </span>
            </div>
            <span className="text-[10px] text-[#5F6B63] font-medium">
              {selectedItem.createdList?.length || 0} Riwayat Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            {!selectedItem.createdList || selectedItem.createdList.length === 0 ? (
              <div className="py-8 text-center text-[#89938D] text-xs">
                <Inbox className="w-6 h-6 text-[#DDE5DF] mx-auto mb-1.5" />
                <p className="font-medium">Belum ada riwayat approval pada CAPEX ini</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="bg-[#FAFCFB] text-[#5F6B63] border-b border-[#E8EFE9]">
                    <th className="py-2 px-3 font-semibold text-[10px] uppercase w-[160px]">
                      Approver
                    </th>
                    <th className="py-2 px-3 font-semibold text-[10px] uppercase w-[130px]">
                      Tanggal
                    </th>
                    <th className="py-2 px-3 font-semibold text-[10px] uppercase">
                      Notes / Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F1]">
                  {sortedCreatedList.map((created, idx) => (
                    <tr key={created.idCreated || idx} className="hover:bg-[#F8FAF9]">
                      {/* Approver */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {created.byte !== null && created.byte !== undefined && (
                            <span
                              className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded text-[9px] font-bold bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]"
                              title={`Urutan Approval Step #${created.byte}`}
                            >
                              #{created.byte}
                            </span>
                          )}
                          <div className="font-semibold text-[#17231B] text-[11px]">
                            {created.nama || "—"}
                          </div>
                        </div>
                        {created.kodeApprover && (
                          <span className="text-[9px] text-[#89938D] font-mono block mt-0.5">
                            {created.kodeApprover}
                          </span>
                        )}
                      </td>

                      {/* Tanggal */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-[#5F6B63] font-mono">
                        {formatDateIndo(created.dateApprove)}
                      </td>

                      {/* Notes */}
                      <td className="py-2.5 px-3 text-[11px] text-[#2C3830]">
                        {created.notes || <span className="text-[#89938D] italic">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
