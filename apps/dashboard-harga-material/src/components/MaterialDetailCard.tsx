"use client";

import React from "react";
import { MaterialItem } from "./MaterialTable";
import { FileText, Tag, Building2, Calendar, ShieldAlert, CheckCircle2, DollarSign } from "lucide-react";

interface MaterialDetailCardProps {
  material: MaterialItem | null;
}

export default function MaterialDetailCard({ material }: MaterialDetailCardProps) {
  if (!material) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs text-center text-[#89938D] text-xs font-medium font-sans">
        Klik salah satu baris material pada tabel di atas untuk melihat rincian detail spesifikasi &amp; vendor.
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const priceDiff = material.hargaRealisasi - material.hargaAcuan;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl shadow-2xs overflow-hidden font-sans" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#16823B] to-[#0B6B32] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <FileText className="w-6 h-6 text-[#A8D437]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{material.namaMaterial}</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-[#A8D437] text-[#0B6B32] font-black text-xs font-mono">
                {material.kodeMaterial}
              </span>
            </div>
            <p className="text-xs text-[#E8F3EA] mt-0.5 font-medium">
              Kategori: {material.kategori} • Satuan: {material.uom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/20">
          <Building2 className="w-4 h-4 text-[#A8D437]" />
          <span>Vendor: {material.vendorUtama}</span>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F8FAF9]">
        
        <div className="p-3.5 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
          <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Harga Acuan Budget</span>
          <span className="text-sm font-extrabold font-mono text-[#17231B] mt-0.5 block">{formatCurrency(material.hargaAcuan)}</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
          <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Harga Realisasi Terbaru</span>
          <span className="text-sm font-extrabold font-mono text-[#16823B] mt-0.5 block">{formatCurrency(material.hargaRealisasi)}</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
          <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Selisih Nominal (Rp)</span>
          <span className={`text-sm font-extrabold font-mono mt-0.5 block ${priceDiff > 0 ? "text-red-600" : priceDiff < 0 ? "text-emerald-700" : "text-gray-700"}`}>
            {priceDiff > 0 ? `+${formatCurrency(priceDiff)}` : formatCurrency(priceDiff)}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
          <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#16823B]" />
            Terakhir Diperbarui
          </span>
          <span className="text-xs font-bold text-[#17231B] mt-0.5 block truncate">{material.tglUpdate}</span>
        </div>

      </div>

      {/* Specifications Body */}
      <div className="p-5 border-t border-[#DDE5DF] bg-white text-xs space-y-2">
        <h4 className="font-extrabold text-[#17231B] text-sm">Spesifikasi &amp; Catatan Logistik:</h4>
        <p className="text-[#5F6B63] leading-relaxed">
          {material.spesifikasi}
        </p>
      </div>
    </div>
  );
}
