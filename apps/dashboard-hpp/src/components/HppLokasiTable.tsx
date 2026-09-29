"use client";

import React, { useState } from "react";
import { Search, MapPin, ChevronDown, ChevronUp, Layers, Tag } from "lucide-react";

export interface LokasiHppItem {
  idLokasiHpp: string;
  lokasi: string;
  idBudget: string;
  periode: number;
  status: string;
  qtyPanen: number;
  luasPanen: number;
  luasAktif: number;
  group: string;
  descGroup: string;
  jenisBiaya: string;
  biaya: number;
  masterSheet?: {
    wilayah: string;
    kodeBibit: string;
    jenisBibit: string;
    kelasBibit: string;
  };
  budgetItem?: {
    budget: number;
  };
}

interface HppLokasiTableProps {
  data: LokasiHppItem[];
  loading?: boolean;
  onSelectLokasi?: (lokasi: LokasiHppItem) => void;
  selectedLokasiId?: string;
}

export default function HppLokasiTable({
  data,
  loading,
  onSelectLokasi,
  selectedLokasiId,
}: HppLokasiTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(val || 0);
  };

  const groupOptions = Array.from(new Set(data.map((item) => item.group))).filter(Boolean);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jenisBiaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.masterSheet?.wilayah.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroupFilter === "all" || item.group === selectedGroupFilter;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E0E8E2] shadow-2xs overflow-hidden flex flex-col" suppressHydrationWarning>
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-[#EAEFEB] bg-[#F8FAF9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" suppressHydrationWarning>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#16823B] text-white rounded-lg shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#17231B] text-base">Analisis Biaya Lokasi HPP</h3>
            <p className="text-xs text-[#5F6B63]">
              Detail alokasi biaya per lokasi, kelompok bibit, dan hasil panen
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto" suppressHydrationWarning>
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56" suppressHydrationWarning>
            <Search className="w-4 h-4 text-[#8C9890] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lokasi, wilayah, biaya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#DDE5DF] rounded-xl text-xs font-medium text-[#17231B] focus:outline-none focus:border-[#16823B] focus:ring-1 focus:ring-[#16823B] transition-all"
            />
          </div>

          {/* Group Dropdown */}
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            suppressHydrationWarning
            className="px-3 py-1.5 bg-white border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#2C3830] focus:outline-none focus:border-[#16823B] transition-all"
          >
            <option value="all">Semua Group</option>
            {groupOptions.map((grp) => (
              <option key={grp} value={grp}>
                Group {grp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F1] text-[#455248] uppercase tracking-wider font-extrabold border-b border-[#E0E8E2]">
              <th className="py-3 px-4">Lokasi / Wilayah</th>
              <th className="py-3 px-4">Bibit (Jenis / Kelas)</th>
              <th className="py-3 px-4">Group & Status</th>
              <th className="py-3 px-4 text-right">Qty Panen (Kg)</th>
              <th className="py-3 px-4 text-right">Luas (Panen / Aktif)</th>
              <th className="py-3 px-4">Jenis Biaya</th>
              <th className="py-3 px-4 text-right">Biaya (Rp)</th>
              <th className="py-3 px-4 text-right">HPP / Kg</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEFEB]">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={9} className="py-4 px-4 bg-gray-50/50">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#8C9890] font-medium">
                  Tidak ada data Lokasi HPP yang sesuai kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isSelected = selectedLokasiId === item.idLokasiHpp;
                const isExpanded = expandedId === item.idLokasiHpp;
                const hppPerKg = item.qtyPanen > 0 ? Number(item.biaya) / Number(item.qtyPanen) : 0;

                return (
                  <React.Fragment key={item.idLokasiHpp}>
                    <tr
                      onClick={() => onSelectLokasi?.(item)}
                      className={`cursor-pointer transition-colors hover:bg-[#F4F8F5] ${
                        isSelected ? "bg-[#EAF3EC] border-l-4 border-l-[#16823B]" : ""
                      }`}
                    >
                      {/* Lokasi / Wilayah */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#17231B] text-sm flex items-center gap-1.5">
                          <span>{item.lokasi}</span>
                          {item.masterSheet?.wilayah && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {item.masterSheet.wilayah}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#5F6B63] mt-0.5 font-medium">ID: {item.idLokasiHpp}</div>
                      </td>

                      {/* Bibit Info */}
                      <td className="py-3.5 px-4">
                        {item.masterSheet ? (
                          <div>
                            <span className="font-bold text-[#2C3830] capitalize">{item.masterSheet.jenisBibit}</span>
                            <div className="text-[10px] text-[#5F6B63] flex items-center gap-1">
                              <span>Kode: {item.masterSheet.kodeBibit}</span>
                              <span>•</span>
                              <span className="capitalize">Kelas: {item.masterSheet.kelasBibit}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-italic">-</span>
                        )}
                      </td>

                      {/* Group & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            {item.group}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[10px]">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5F6B63] truncate max-w-[140px] mt-0.5">
                          {item.descGroup}
                        </div>
                      </td>

                      {/* Qty Panen */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#17231B]">
                        {formatNumber(Number(item.qtyPanen))} Kg
                      </td>

                      {/* Luas Panen & Aktif */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-[#2C3830]">{formatNumber(Number(item.luasPanen))} Ha</div>
                        <div className="text-[10px] text-[#5F6B63]">Aktif: {formatNumber(Number(item.luasAktif))} Ha</div>
                      </td>

                      {/* Jenis Biaya */}
                      <td className="py-3.5 px-4 font-semibold text-[#2C3830]">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F0F4F1] border border-[#E0E8E2]">
                          <Tag className="w-3 h-3 text-[#16823B]" />
                          {item.jenisBiaya}
                        </span>
                      </td>

                      {/* Biaya Rp */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#16823B]">
                        {formatCurrency(Number(item.biaya))}
                      </td>

                      {/* HPP / Kg */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#17231B]">
                        {formatCurrency(hppPerKg)}
                      </td>

                      {/* Expand Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : item.idLokasiHpp);
                          }}
                          suppressHydrationWarning
                          className="p-1 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
                          title="Lihat Detail Tambahan"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Detail Drawer Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAFDFB]">
                        <td colSpan={9} className="p-4 border-b border-[#E0E8E2]">
                          <div className="bg-white p-4 rounded-xl border border-[#D5E1D8] shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="font-bold text-xs text-[#16823B] uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                rincian data lokasi: {item.lokasi} (Periode {item.periode})
                              </span>
                              <span className="text-[11px] text-[#5F6B63]">ID Budget Link: {item.idBudget}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#EAEFEB]">
                                <span className="text-[#5F6B63] text-[10px] block font-semibold">Anggaran Group</span>
                                <span className="font-bold text-[#17231B]">
                                  {item.budgetItem ? formatCurrency(Number(item.budgetItem.budget)) : "-"}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#EAEFEB]">
                                <span className="text-[#5F6B63] text-[10px] block font-semibold">Yield Produktivitas</span>
                                <span className="font-bold text-[#16823B]">
                                  {item.luasPanen > 0 ? formatNumber(Number(item.qtyPanen) / Number(item.luasPanen)) : 0} Kg/Ha
                                </span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#EAEFEB]">
                                <span className="text-[#5F6B63] text-[10px] block font-semibold">Deskripsi Zone</span>
                                <span className="font-semibold text-[#2C3830]">{item.descGroup}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#EAEFEB]">
                                <span className="text-[#5F6B63] text-[10px] block font-semibold">Status Alokasi</span>
                                <span className="font-bold text-blue-700">{item.status}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#F8FAF9] border-t border-[#EAEFEB] text-xs text-[#5F6B63] flex justify-between items-center">
        <span>Menampilkan {filteredData.length} dari {data.length} data Lokasi HPP</span>
        <span className="font-medium text-[11px]">GGF AgroMetric Cost Control</span>
      </div>
    </div>
  );
}
