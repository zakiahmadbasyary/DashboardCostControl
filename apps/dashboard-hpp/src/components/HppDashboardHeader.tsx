"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import { LayoutGrid, ShieldCheck, Menu, X, Wrench } from "lucide-react";

export default function HppDashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { portalUrl, adminUrl, navItems } = getDashboardNavConfig();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full font-sans">
      <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Title - Responsive Scaling */}
          <a href={portalUrl} className="flex items-center gap-2 sm:gap-3.5 shrink-0 py-1 group focus:outline-none min-w-0">
            <div className="h-10 sm:h-14 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-10 sm:h-14 max-h-14 w-auto object-contain"
                style={{ height: "40px", maxHeight: "56px", width: "auto" }}
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-extrabold text-sm sm:text-lg text-[#17231B] group-hover:text-[#16823B] tracking-tight leading-tight transition-colors truncate">
                Dashboard HPP
              </span>
              <span className="text-[11px] sm:text-sm text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                Dashboard Cost Control
              </span>
            </div>
          </a>

          {/* Right Action Buttons & Hamburger Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <a
              href={portalUrl}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs sm:text-sm transition-all shadow-xs"
              title="Buka Portal Utama"
              suppressHydrationWarning
            >
              <LayoutGrid className="w-4 h-4 text-[#5F6B63]" />
              <span>Portal Utama</span>
            </a>

            <a
              href={adminUrl}
              className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              title="Buka Admin Pusat"
              suppressHydrationWarning
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Admin Pusat</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              aria-label="Toggle Menu"
              suppressHydrationWarning
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#16823B]" /> : <Menu className="w-4 h-4 text-[#16823B]" />}
              <span className="hidden sm:inline">Menu Dashboard</span>
              <span className="sm:hidden text-xs">Menu</span>
            </button>
          </div>

        </div>
      </div>

      {/* Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#DDE5DF] bg-white px-3 sm:px-4 py-3.5 sm:py-4 space-y-3 shadow-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="w-full max-w-[95%] mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#5F6B63] uppercase tracking-wider px-1">
              <span>Navigasi Dashboard Cost Control (9 Menu)</span>
              <span className="text-[10px] text-[#16823B] font-semibold">GGF AgroMetric</span>
            </div>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {navItems.map((item) => {
                const isActive = item.key === "hpp";
                const isHosted = item.isHosted !== false;

                if (!isHosted) {
                  return (
                    <span
                      key={item.key}
                      className="px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-xs font-semibold text-gray-400 bg-gray-50/70 border border-gray-200/60 select-none cursor-not-allowed flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{item.label}</span>
                        <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded font-medium shrink-0">
                        Pembuatan
                      </span>
                    </span>
                  );
                }

                return (
                  <a
                    key={item.key}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all border ${
                      isActive
                        ? "bg-[#EAF3EC] text-[#16823B] font-bold border-[#CBE0D1]"
                        : "text-[#2C3830] hover:bg-[#F8FAF9] border-[#EAEFEB]"
                    }`}
                    title={item.description}
                  >
                    <span className="truncate mr-1">{item.label}</span>
                    {isActive && (
                      <span className="text-[9px] sm:text-[10px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                        Aktif
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E3EBE5] flex sm:hidden flex-col gap-2">
              <a
                href={portalUrl}
                className="w-full text-center py-2.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
              <a
                href={adminUrl}
                className="w-full text-center py-2.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
