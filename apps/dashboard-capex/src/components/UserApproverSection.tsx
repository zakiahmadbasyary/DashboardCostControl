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

  // Derived selected approver: falls back to first approver if none selected
  const selectedApprover =
    (selectedKode ? approvers.find((a) => a.kodeApprover === selectedKode) : null) ||
    approvers[0] ||
    null;

  const filteredApprovers = approvers.filter((app) => {
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
        <div className="lg:col-span-5 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE9] gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#16823B]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#17231B] tracking-wide">
                Daftar User Approver
              </h3>
            </div>
            <span className="text-[10px] text-[#89938D] font-medium">
              {approvers.length} approver
            </span>
          </div>

          {/* Approver Search */}
          <div className="relative my-3">
            <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau kode approver..."
              value={approverSearch}
              onChange={(e) => setApproverSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-[#5F6B63] gap-2">
                <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin" />
                <span>Memuat data approver...</span>
              </div>
            ) : filteredApprovers.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#89938D] space-y-1">
                <Inbox className="w-6 h-6 text-[#DDE5DF] mx-auto" />
                <p>Tidak ada approver yang ditemukan</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAF9] text-[#5F6B63] border-b border-[#E8EFE9]">
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase w-[110px]">
                      Index (Kode)
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase">
                      User Approver
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-[80px]">
                      Pending
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F1]">
                  {filteredApprovers.map((app) => {
                    const isSelected = app.kodeApprover === selectedKode;
                    const hasPending = app.pendingCount > 0;

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
                        {/* 1. Index (Kode Approver) */}
                        <td className="py-3 px-3 font-mono text-[11px] text-[#5F6B63] whitespace-nowrap">
                          <span
                            className={
                              isSelected ? "text-[#16823B] font-bold" : "text-[#5F6B63]"
                            }
                          >
                            {app.kodeApprover}
                          </span>
                        </td>

                        {/* 2. User Approver (Nama) */}
                        <td className="py-3 px-3">
                          <div
                            className={`text-xs ${
                              isSelected ? "text-[#16823B] font-bold" : "text-[#17231B]"
                            }`}
                          >
                            {app.nama || "—"}
                          </div>
                        </td>

                        {/* 3. Pending Count */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
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

          <div className="pt-3 mt-3 border-t border-[#E8EFE9] text-[10px] text-[#89938D]">
            * Pending dihitung dari tabel <code className="font-mono">Created</code> yang belum disetujui (<code className="font-mono">date_approve = NULL</code>).
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD KANAN: 4.2 DAFTAR CAPEX PENDING (cols 7/12)               */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[380px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8EFE9] gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#b45309]" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#17231B]  tracking-wide">
                  Daftar CAPEX Pending
                </h3>
                {selectedApprover && (
                  <p className="text-[11px] text-[#5F6B63]">
                    Menampilkan pengajuan pending untuk:{" "}
                    <strong className="text-[#17231B]">
                      {selectedApprover.nama || selectedApprover.kodeApprover}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            {selectedApprover && (
              <span className="text-[10px] font-bold bg-[#FEF6E5] text-[#b45309] border border-[#FCDFA8] px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0">
                {selectedApprover.pendingCount} Menunggu Approval
              </span>
            )}
          </div>

          {/* Search inside pending */}
          {pendingList.length > 0 && (
            <div className="relative my-3">
              <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari no CAPEX, IO/WBS, atau deskripsi pending..."
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
              />
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-x-auto my-1">
            {!selectedApprover ? (
              <div className="py-12 text-center text-xs text-[#89938D]">
                <Inbox className="w-7 h-7 text-[#DDE5DF] mx-auto mb-1" />
                <p>Pilih salah satu approver di sebelah kiri</p>
              </div>
            ) : pendingList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5F6B63] space-y-1 bg-[#F8FAF9] rounded-xl border border-[#E8EFE9] my-3">
                <CheckCircle2 className="w-8 h-8 text-[#16823B] mx-auto mb-1" />
                <p className="font-bold text-[#17231B]">
                  Tidak ada CAPEX pending untuk approver ini!
                </p>
                <p className="text-[11px] text-[#89938D] max-w-xs mx-auto">
                  Seluruh pengajuan belanja modal telah disetujui atau belum ada tugas approval baru.
                </p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#89938D]">
                <p>Tidak ada data pending yang cocok dengan kata kunci pencarian</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-[#F8FAF9] text-[#5F6B63] border-b border-[#E8EFE9]">
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase w-[120px]">
                      No CAPEX
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase">
                      Deskripsi
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-[130px]">
                      Price
                    </th>
                    <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-center w-[120px]">
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
                        <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                          {p.capexNo ? (
                            <span className="font-bold text-[#17231B]">{p.capexNo}</span>
                          ) : (
                            <span className="text-[#89938D] italic">—</span>
                          )}
                        </td>

                        {/* 2. Deskripsi */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#17231B] text-xs line-clamp-2">
                            {p.description || "—"}
                          </div>
                        </td>

                        {/* 3. Price */}
                        <td className="py-3 px-3 text-right font-mono text-[11px] font-bold text-[#17231B] whitespace-nowrap">
                          {formatCurrencyRp(p.amount)}
                        </td>

                        {/* 4. IO - WBS - MO */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
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

          <div className="pt-3 mt-3 border-t border-[#E8EFE9] flex items-center justify-between text-[11px] text-[#5F6B63]">
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
