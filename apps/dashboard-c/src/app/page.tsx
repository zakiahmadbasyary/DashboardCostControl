"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import { Receipt, LayoutGrid, ShieldCheck, Menu, X } from "lucide-react";

export default function DashboardOpexPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { portalUrl, adminUrl, navItems } = getDashboardNavConfig();

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Dedicated Header for Dashboard Opex */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-18 flex items-center justify-between gap-4">
            {/* Brand Logo & Title */}
            <a href={portalUrl} className="flex items-center gap-3 shrink-0 py-1 group focus:outline-none">
              <div className="h-13 sm:h-14 w-auto flex items-center shrink-0">
                <img
                  src="/logo.png"
                  alt="GGF Logo"
                  className="h-13 sm:h-14 max-h-14 w-auto object-contain"
                  style={{ height: "52px", maxHeight: "56px", width: "auto" }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-sm sm:text-base text-[#17231B] group-hover:text-[#16823B] tracking-tight leading-snug transition-colors block">
                  Dashboard Opex
                </span>
                <span className="text-[10px] sm:text-xs text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                  Operational Expenditure
                </span>
              </div>
            </a>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0 whitespace-nowrap overflow-x-auto py-1 max-w-2xl no-scrollbar">
              {navItems.map((item) => {
                const isActive = item.key === "opex";
                return (
                  <a
                    key={item.key}
                    href={item.url}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1]"
                        : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#16823B]" />}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <a
                href={portalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all shadow-xs"
                title="Buka Portal Utama"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>

              <a
                href={adminUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs transition-all shadow-xs"
                title="Buka Admin Pusat"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-[#2C3830] hover:bg-[#F4F7F5] transition-colors border border-[#DDE5DF]"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#16823B]" /> : <Menu className="w-5 h-5 text-[#5F6B63]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#DDE5DF] bg-white px-4 py-3 space-y-2 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider mb-1 px-1">
              Navigasi Dashboard (9 Menu)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {navItems.map((item) => {
                const isActive = item.key === "opex";
                return (
                  <a
                    key={item.key}
                    href={item.url}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                      isActive
                        ? "bg-[#EAF3EC] text-[#16823B] font-bold border-[#CBE0D1]"
                        : "text-[#2C3830] hover:bg-[#F8FAF9] border-[#EAEFEB]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-[9px] bg-[#16823B] text-white px-1.5 py-0.5 rounded-full font-bold">
                        Aktif
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
            <div className="pt-2 border-t border-[#E3EBE5] flex flex-col gap-2">
              <a
                href={portalUrl}
                className="w-full text-center py-2 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
              <a
                href={adminUrl}
                className="w-full text-center py-2 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto my-12 text-center space-y-6 px-4 flex-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
          Opex Operational Module
        </span>
        <div className="w-16 h-16 rounded-2xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center mx-auto shadow-2xs">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#17231B]">Dashboard Opex (Operational Expenditure)</h2>
        <p className="text-[#5F6B63] text-sm leading-relaxed max-w-xl mx-auto">
          Modul monitoring dan pengendalian biaya operasional harian (Operational Expenditure) perkebunan.
        </p>
      </main>

      <footer className="text-center text-xs text-[#5F6B63] border-t border-[#DDE5DF] bg-white py-6">
        © 2026 GGF AgroMetric Platform — Dashboard Opex Workspace
      </footer>
    </div>
  );
}
