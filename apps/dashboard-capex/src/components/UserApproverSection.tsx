"use client";

import React, { useState } from "react";
import { UserApproverItem } from "@/types/capex";
import { getIoWbsMoDisplay, formatCurrencyRp } from "@/lib/formatters";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  UserCheck,
  Search,
} from "lucide-react";

interface UserApproverSectionProps {
  approvers: UserApproverItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function UserApproverSection({
  approvers,
  loading = false,
  error = null,
  onRetry,
}: UserApproverSectionProps) {
  const [selectedKode, setSelectedKode] = useState<string | null>(null);
  const [approverSearch, setApproverSearch] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");

  // Ranking user approver berdasarkan jumlah pending terbanyak (descending)
  const sortedApprovers = React.useMemo(() => {
    return [...approvers].sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) {
        return b.pendingCount - a.pendingCount;
      }
      return (a.nama || a.kodeApprover).localeCompare(b.nama || b.kodeApprover);
    });
  }, [approvers]);

  // Map peringkat global tetap konsisten saat difilter via search bar
  const rankMap = React.useMemo(() => {
    const map = new Map<string, number>();
    sortedApprovers.forEach((app, idx) => {
      map.set(app.kodeApprover, idx + 1);
    });
    return map;
  }, [sortedApprovers]);

  // Derived selected approver: default ke peringkat #1 (pending terbanyak) jika belum ada pilihan
  const selectedApprover =
    (selectedKode ? sortedApprovers.find((a) => a.kodeApprover === selectedKode) : null) ||
    sortedApprovers[0] ||
    null;

  const filteredApprovers = sortedApprovers.filter((app) => {
    if (!approverSearch.trim()) return true;
    const q = approverSearch.toLowerCase().trim();
    return (
      app.kodeApprover.toLowerCase().includes(q) ||
      (app.nama || "").toLowerCase().includes(q)
    );
  });

  const pendingList = selectedApprover ? selectedApprover.pendingItems : [];
  const filteredPending = pendingList.filter((item) => {
    if (!pendingSearch.trim()) return true;
    const q = pendingSearch.toLowerCase().trim();
    const ioWbsMo = getIoWbsMoDisplay(item).value.toLowerCase();
    const capexNo = (item.capexNo || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    return ioWbsMo.includes(q) || capexNo.includes(q) || desc.includes(q);
  });

  const totalPendingAcrossAll = approvers.reduce((s, a) => s + a.pendingCount, 0);

  return (
    <section className="space-y-4 font-sans" suppressHydrationWarning>
      {/* ── SECTION HEADER ── */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#17231B]">
              Area User Approver & Tracking Pending CAPEX
            </h3>
            <span className="text-[10px] bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8] px-2 py-0.5 rounded-full font-semibold">
              {totalPendingAcrossAll} Pending Total
            </span>
          </div>
          <p className="text-xs text-[#5F6B63]">
            Bagian ini{" "}
            <span className="font-semibold text-[#16823B]">
              independen dari Main Filter
            </span>
            . Menampilkan seluruh data approval per approver yang berwenang.
          </p>
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {/* ── 2 CARDS GRID: KIRI & KANAN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* ============================================================== */}
        {/* CARD KIRI: 4.1 DAFTAR USER APPROVER (cols 5/12)                */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE9] gap-2 min-h-[44px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#16823B]/10 text-[#16823B] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-[#17231B] tracking-wide truncate">
                  Daftar User Approver
                </h3>
                <p className="text-[11px] text-[#5F6B63] truncate">
                  Diranking dari pending terbanyak • Klik untuk detail
                </p>
              </div>
            </div>
            <span className="text-[10px] text-[#5F6B63] bg-[#F4F7F5] border border-[#DDE5DF] px-2.5 py-1 rounded-full font-semibold shrink-0">
              {approvers.length} approver
            </span>
          </div>

          {/* Approver Search */}
          <div className="relative my-3 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau kode approver..."
              value={approverSearch}
              onChange={(e) => setApproverSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
              suppressHydrationWarning
            />
          </div>

          {/* Table Container (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto border border-[#E8EFE9] rounded-xl bg-white shadow-2xs">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-xs text-[#5F6B63] gap-2">
                <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin" />
                <span>Memuat data approver...</span>
              </div>
            ) : filteredApprovers.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#89938D] space-y-1">
                <Inbox className="w-6 h-6 text-[#DDE5DF] mx-auto" />
                <p>Tidak ada approver yang ditemukan</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F8FAF9] shadow-2xs">
                  <tr className="text-[#5F6B63] border-b border-[#E8EFE9]">
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase w-[120px] bg-[#F8FAF9]">
                      Rank • Kode
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase bg-[#F8FAF9]">
                      User Approver
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-[80px] bg-[#F8FAF9]">
                      Pending
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F1]">
                  {filteredApprovers.map((app) => {
                    const isSelected = app.kodeApprover === selectedKode;
                    const hasPending = app.pendingCount > 0;
                    const rank = rankMap.get(app.kodeApprover) || 1;

                    return (
                      <tr
                        key={app.kodeApprover}
                        onClick={() => setSelectedKode(app.kodeApprover)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#EAF3EC] border-l-4 border-l-[#16823B] font-bold"
                            : "hover:bg-[#F8FAF9]"
                        }`}
                      >
                        {/* 1. Rank & Kode Approver */}
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                rank === 1 && hasPending
                                  ? "bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8]"
                                  : rank === 2 && hasPending
                                  ? "bg-[#F0F4F1] text-[#2C3830] border border-[#D0DDD4]"
                                  : rank === 3 && hasPending
                                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                                  : "text-[#89938D] bg-[#F4F7F5]"
                              }`}
                              title={`Peringkat #${rank} (${app.pendingCount} pending)`}
                            >
                              #{rank}
                            </span>
                            <span
                              className={
                                isSelected ? "text-[#16823B] font-bold" : "text-[#5F6B63]"
                              }
                            >
                              {app.kodeApprover}
                            </span>
                          </div>
                        </td>

                        {/* 2. User Approver (Nama) */}
                        <td className="py-2.5 px-3">
                          <div
                            className={`text-xs ${
                              isSelected ? "text-[#16823B] font-bold" : "text-[#17231B]"
                            }`}
                          >
                            {app.nama || "—"}
                          </div>
                        </td>

                        {/* 3. Pending Count */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {hasPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8]">
                              <Clock className="w-2.5 h-2.5" />
                              {app.pendingCount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4F7F5] text-[#89938D]">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#16823B]" />
                              0
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Card Kiri */}
          <div className="pt-2.5 mt-2.5 border-t border-[#E8EFE9] flex items-center justify-between text-[11px] text-[#5F6B63] shrink-0">
            <span>
              Menampilkan <strong className="text-[#17231B]">{filteredApprovers.length}</strong> dari <strong className="text-[#17231B]">{approvers.length}</strong> approver
            </span>
            <span className="text-[10px] text-[#89938D]">
              Klik baris untuk pilih
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD KANAN: 4.2 DAFTAR CAPEX PENDING (cols 7/12)               */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE9] gap-2 min-h-[44px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#b45309]/10 text-[#b45309] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-[#17231B] tracking-wide truncate">
                  Daftar CAPEX Pending
                </h3>
                <p className="text-[11px] text-[#5F6B63] truncate">
                  {selectedApprover ? (
                    <>
                      Menampilkan pending untuk:{" "}
                      <strong className="text-[#17231B]">
                        {selectedApprover.nama || selectedApprover.kodeApprover}
                      </strong>
                    </>
                  ) : (
                    "Pilih approver di sebelah kiri"
                  )}
                </p>
              </div>
            </div>

            {selectedApprover && (
              <span className="text-[10px] font-bold bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8] px-2.5 py-1 rounded-full shrink-0">
                {selectedApprover.pendingCount} Menunggu Approval
              </span>
            )}
          </div>

          {/* Search inside pending */}
          <div className="relative my-3 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no CAPEX, IO/WBS, atau deskripsi pending..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              disabled={!selectedApprover || pendingList.length === 0}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            />
          </div>

          {/* Table Container (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto border border-[#E8EFE9] rounded-xl bg-white shadow-2xs">
            {!selectedApprover ? (
              <div className="py-16 text-center text-xs text-[#89938D]">
                <Inbox className="w-7 h-7 text-[#DDE5DF] mx-auto mb-1" />
                <p>Pilih salah satu approver di sebelah kiri</p>
              </div>
            ) : pendingList.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#5F6B63] space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-[#16823B] mx-auto mb-1" />
                <p className="font-bold text-[#17231B]">
                  Tidak ada CAPEX pending untuk approver ini!
                </p>
                <p className="text-[11px] text-[#89938D] max-w-xs mx-auto">
                  Seluruh pengajuan belanja modal telah disetujui atau belum ada tugas approval baru.
                </p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#89938D]">
                <p>Tidak ada data pending yang cocok dengan kata kunci pencarian</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[500px] border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F8FAF9] shadow-2xs">
                  <tr className="text-[#5F6B63] border-b border-[#E8EFE9]">
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase w-[120px] bg-[#F8FAF9]">
                      No CAPEX
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase bg-[#F8FAF9]">
                      Deskripsi
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-[130px] bg-[#F8FAF9]">
                      Price
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-center w-[120px] bg-[#F8FAF9]">
                      IO - WBS - MO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F1]">
                  {filteredPending.map((p, idx) => {
                    const ioDisplay = getIoWbsMoDisplay(p);

                    return (
                      <tr
                        key={p.idCreated || idx}
                        className="hover:bg-[#F8FAF9] transition-colors"
                      >
                        {/* 1. No CAPEX */}
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          {p.capexNo ? (
                            <span className="font-bold text-[#17231B]">{p.capexNo}</span>
                          ) : (
                            <span className="text-[#89938D] italic">—</span>
                          )}
                        </td>

                        {/* 2. Deskripsi */}
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-[#17231B] text-xs line-clamp-2">
                            {p.description || "—"}
                          </div>
                        </td>

                        {/* 3. Price */}
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] font-bold text-[#17231B] whitespace-nowrap">
                          {formatCurrencyRp(p.amount)}
                        </td>

                        {/* 4. IO - WBS - MO */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="font-mono text-[11px] font-bold text-[#16823B]">
                              {ioDisplay.value}
                            </span>
                            {ioDisplay.type !== "NONE" && (
                              <span className="text-[9px] text-[#89938D]">
                                ({ioDisplay.type})
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Card Kanan */}
          <div className="pt-2.5 mt-2.5 border-t border-[#E8EFE9] flex items-center justify-between text-[11px] text-[#5F6B63] shrink-0">
            <span>
              Menampilkan{" "}
              <strong className="text-[#17231B]">{filteredPending.length}</strong> dari{" "}
              <strong className="text-[#17231B]">{pendingList.length}</strong> pengajuan pending
            </span>
            <span className="text-[10px] text-[#89938D]">
              Filter utama tidak berlaku pada tabel ini
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
