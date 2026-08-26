"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-[#DDE5DF] sticky top-0 z-30 shadow-xs">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Module */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-9 sm:h-10 w-auto flex items-center shrink-0">
            <Image
              src={logoImg}
              alt="GGF Logo"
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#17231B] tracking-tight">Dashboard WIP ACC</span>
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
