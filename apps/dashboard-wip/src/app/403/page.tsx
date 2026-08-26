"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#DDE5DF] rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> 403 Forbidden Access
          </div>
          <h1 className="text-2xl font-extrabold text-[#17231B]">Akses Ditolak</h1>
          <p className="text-[#5F6B63] text-xs leading-relaxed">
            Akun administrator Anda terverifikasi di **Admin Pusat**, tetapi Anda **tidak memiliki hak akses** untuk mengelola halaman administrasi **Dashboard WIP Cost Control**.
          </p>
        </div>

        <div className="p-4 bg-[#F4F7F5] border border-[#DDE5DF] rounded-2xl text-left text-xs space-y-1.5">
          <span className="font-bold text-[#17231B]">Petunjuk:</span>
          <p className="text-[#5F6B63]">
            Silakan hubungi **Super Admin** platform jika Anda memerlukan hak akses untuk mengelola dashboard ini.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a
            href="http://localhost:3001/dashboard"
            className="w-full py-3 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Admin Pusat</span>
          </a>

          <Link
            href="/"
            className="w-full py-2.5 rounded-xl border border-[#DDE5DF] hover:bg-[#F4F7F5] text-[#2C3830] font-semibold text-xs transition-all"
          >
            Ke Halaman Utama Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
