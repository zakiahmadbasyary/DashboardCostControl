"use client";

import React, { useState } from "react";
import { Activity, Calendar, Search } from "lucide-react";

export interface AktivitasHppItem {
  idAktivitas: string;
  lokasi: string;
  tanggalMulaiRawat?: string | null;
  tanggalMulaiTanam?: string | null;
  tanggalForcingStandard?: string | null;
  rencanaForcing?: string | null;
  realForcing?: string | null;
  rencanaPanen?: string | null;
  aktivitas: string;
  biaya: number;
  hasil: number;
  uom: string;
  group: string;
  masterSheet?: {
    wilayah: string;
    jenisBibit: string;
  };
}

interface HppAktivitasTableProps {
  data: AktivitasHppItem[];
  loading?: boolean;
}

export default function HppAktivitasTable({ data, loading }: HppAktivitasTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.aktivitas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E0E8E2] shadow-2xs overflow-hidden flex flex-col" suppressHydrationWarning>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#EAEFEB] bg-[#F8FAF9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" suppressHydrationWarning>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#17231B] text-base">Riwayat Aktivitas & Perawatan HPP</h3>
            <p className="text-xs text-[#5F6B63]">
              Catatan operasional aktivitas pemeliharaan, tanggal forcing, dan jadwal panen
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64" suppressHydrationWarning>
          <Search className="w-4 h-4 text-[#8C9890] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas, lokasi, group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            suppressHydrationWarning
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#DDE5DF] rounded-xl text-xs font-medium text-[#17231B] focus:outline-none focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F1] text-[#455248] uppercase tracking-wider font-extrabold border-b border-[#E0E8E2]">
              <th className="py-3 px-4">Nama Aktivitas</th>
              <th className="py-3 px-4">Lokasi / Group</th>
              <th className="py-3 px-4">Tgl Rawat / Tanam</th>
              <th className="py-3 px-4">Tgl Forcing (Rencana / Real)</th>
              <th className="py-3 px-4">Rencana Panen</th>
              <th className="py-3 px-4 text-right">Hasil Output</th>
              <th className="py-3 px-4 text-right">Biaya (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEFEB]">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4 bg-gray-50/50">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8C9890] font-medium">
                  Belum ada catatan aktivitas HPP yang sesuai.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.idAktivitas} className="hover:bg-[#F4F8F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#17231B]">
                    <div className="text-sm">{item.aktivitas}</div>
                    <div className="text-[10px] text-[#5F6B63] font-normal">ID: {item.idAktivitas}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                      {item.lokasi}
                    </span>
                    <span className="ml-1.5 font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                      {item.group}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-[#2C3830]">
                      <Calendar className="w-3 h-3 text-[#5F6B63]" />
                      <span>Rawat: {formatDate(item.tanggalMulaiRawat)}</span>
                    </div>
                    <div className="text-[10px] text-[#5F6B63] mt-0.5">Tanam: {formatDate(item.tanggalMulaiTanam)}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#2C3830]">Standard: {formatDate(item.tanggalForcingStandard)}</div>
                    <div className="text-[10px] text-[#5F6B63] mt-0.5">
                      Rencana: {formatDate(item.rencanaForcing)} • Real: <span className="font-bold text-emerald-700">{formatDate(item.realForcing)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#16823B]">
                    {formatDate(item.rencanaPanen)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#17231B]">
                    {item.hasil} {item.uom}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#16823B]">
                    {formatCurrency(Number(item.biaya))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
