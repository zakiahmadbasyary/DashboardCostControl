"use client";

import Link from "next/link";
import { LogIn, Leaf } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-[#DDE5DF] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Module */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#16823B] flex items-center justify-center text-white shadow-sm shadow-[#16823B]/30 shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#A8D437]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#17231B] tracking-tight">GGF AgroMetric</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] font-semibold border border-[#16823B]/20">
                WIP ACC
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#5F6B63] hidden xs:block sm:block">Cost Control Dashboard & Data Analysis</p>
          </div>
        </div>

        {/* Action: Login Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Masuk Admin</span>
        </Link>
      </div>
    </header>
  );
}
