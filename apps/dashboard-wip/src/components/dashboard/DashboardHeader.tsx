"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import { LayoutGrid, ShieldCheck, Menu, X, Wrench } from "lucide-react";

export default function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { portalUrl, adminUrl, navItems } = getDashboardNavConfig();

  return (
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
                Dashboard WIP
              </span>
              <span className="text-[10px] sm:text-xs text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                Dashboard Cost Control
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0 whitespace-nowrap overflow-hidden py-1">
            {navItems.map((item) => {
              const isActive = item.key === "wip";
              const isHosted = item.isHosted !== false;

              if (!isHosted) {
                return (
                  <span
                    key={item.key}
                    className="px-1.5 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold text-gray-400 bg-gray-50/70 border border-gray-200/60 select-none cursor-not-allowed flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>{item.label}</span>
                    <Wrench className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-amber-500 shrink-0" />
                  </span>
                );
              }

              return (
                <a
                  key={item.key}
                  href={item.url}
                  className={`px-1.5 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold transition-all flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1]"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                  title={item.description}
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
              const isActive = item.key === "wip";
              const isHosted = item.isHosted !== false;

              if (!isHosted) {
                return (
                  <span
                    key={item.key}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 bg-gray-50/70 border border-gray-200/60 select-none cursor-not-allowed flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1 py-0.5 rounded font-medium">
                      Perbaikan
                    </span>
                  </span>
                );
              }

              return (
                <a
                  key={item.key}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#16823B] font-bold border-[#CBE0D1]"
                      : "text-[#2C3830] hover:bg-[#F8FAF9] border-[#EAEFEB]"
                  }`}
                  title={item.description}
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
  );
}
