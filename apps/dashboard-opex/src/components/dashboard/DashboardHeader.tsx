"use client";

import React, { useState, useEffect } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import {
  LayoutGrid,
  ShieldCheck,
  Menu,
  X,
  Wrench,
  Search,
  ChevronRight,
  Building2,
  DollarSign,
  TrendingUp,
  Gauge,
  Calendar,
} from "lucide-react";

interface DashboardHeaderProps {
  activeSection?: "pg1" | "antar-pg";
  onSelectSection?: (section: "pg1" | "antar-pg") => void;
  lastUpdated?: string | Date | null;
}

export default function DashboardHeader({
  activeSection = "pg1",
  onSelectSection,
  lastUpdated,
}: DashboardHeaderProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { portalUrl, adminUrl, capexUrl, opexUrl, pollPg1Url } = getDashboardNavConfig();

  // Daftar 3 Modul Khusus Kategori Overhead
  const overheadNavItems = [
    {
      key: "capex",
      label: "CAPEX",
      subtitle: "Capital Expenditure",
      url: capexUrl,
      description: "Pengajuan, realisasi & tracking anggaran belanja modal perusahaan",
      icon: Building2,
      isHosted: true,
    },
    {
      key: "opex",
      label: "OPEX",
      subtitle: "Operating Expense",
      url: opexUrl,
      description: "Monitoring beban operasional harian, departemen & komparasi antar PG",
      icon: DollarSign,
      isHosted: true,
    },
    {
      key: "poll_pg1",
      label: "Pool PG 1",
      subtitle: "Fasilitas & Kendaraan",
      url: pollPg1Url,
      description: "Pengelolaan armada kendaraan, alat berat, dan fasilitas operasional PG 1",
      icon: Gauge,
      isHosted: false,
    },
  ];

  // Handle ESC key & lock body scroll when desktop expanded sidebar is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Filter items by search query (khusus 3 modul Overhead)
  const filteredNavItems = overheadNavItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* ========================================================= */}
      {/* 1. LEFT MINI SIDEBAR (Default view on desktop, w-16 / 64px) */}
      {/* ========================================================= */}
      <aside
        className="fixed top-0 bottom-0 left-0 w-16 bg-white border-r border-[#DDE5DF] z-50 hidden md:flex flex-col items-center py-4 shadow-xs select-none overflow-visible"
        aria-label="Mini Sidebar Menu Modul Overhead"
      >
        {/* Top: Hamburger Button & Overhead Module Icons */}
        <div className="w-full flex flex-col items-center">
          {/* Hamburger Button */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              suppressHydrationWarning
              className="w-10 h-10 rounded-xl bg-[#F8FAF9] hover:bg-[#EEF4F0] border border-[#DDE5DF] text-[#16823B] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              aria-label={sidebarOpen ? "Tutup Menu Modul Overhead" : "Buka Menu Modul Overhead"}
              title="Menu Modul Overhead"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Tooltip for Hamburger */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#17231B] text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[90] whitespace-nowrap border border-gray-700/60 flex items-center gap-2">
              <span className="font-bold text-xs text-white">Modul Overhead</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                3 Modul
              </span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#17231B]" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-[#EAEFEB] my-3" />

          {/* Vertical Module Icons List (Khusus 3 Modul Overhead) */}
          <div className="w-full flex flex-col items-center gap-2 py-1 px-2 overflow-visible">
            {overheadNavItems.map((item) => {
              const isActive = item.key === "opex";
              const isHosted = item.isHosted;
              const IconComponent = item.icon;

              return (
                <div key={item.key} className="relative group w-full flex justify-center">
                  <a
                    href={isHosted ? item.url : undefined}
                    onClick={(e) => {
                      if (!isHosted) {
                        e.preventDefault();
                      }
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-150 ${
                      isActive
                        ? "bg-[#16823B] text-white shadow-xs font-bold ring-2 ring-[#16823B]/30"
                        : isHosted
                        ? "text-[#5F6B63] hover:text-[#16823B] hover:bg-[#EAF3EC]"
                        : "text-gray-300 hover:text-amber-700 hover:bg-amber-50 cursor-not-allowed"
                    }`}
                    aria-label={item.label}
                  >
                    <IconComponent className="w-5 h-5 shrink-0" />

                    {/* Active left indicator pill */}
                    {isActive && (
                      <span className="absolute -left-2 w-1 h-5 bg-[#16823B] rounded-r-full" />
                    )}
                  </a>

                  {/* Floating Rich Tooltip */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#17231B] text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[90] min-w-[210px] max-w-[260px] flex flex-col gap-1 border border-gray-700/60 drop-shadow-xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-emerald-300 leading-tight">
                          {item.subtitle}
                        </span>
                      </div>
                      {isActive ? (
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          Aktif
                        </span>
                      ) : !isHosted ? (
                        <span className="text-[9px] bg-amber-500/30 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">
                          <Wrench className="w-2.5 h-2.5" />
                          Pembuatan
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-medium shrink-0">
                          Tersedia
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-300 leading-snug mt-0.5">
                      {item.description}
                    </p>
                    {/* Tooltip triangle arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#17231B]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. TOP NAVBAR                                             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DDE5DF] shadow-2xs w-full font-sans">
        <div className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo & Title */}
            <a
              href={portalUrl}
              className="flex items-center gap-2 sm:gap-3.5 shrink-0 py-1 group focus:outline-none min-w-0"
              title="Ke Portal Utama"
            >
              <div className="h-10 sm:h-14 w-auto flex items-center shrink-0">
                <img
                  src="/logo.png"
                  alt="GGF Logo"
                  className="h-10 sm:h-14 max-h-14 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-lg text-[#17231B] group-hover:text-[#16823B] tracking-tight leading-tight transition-colors truncate">
                    Dashboard OPEX
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] hidden sm:inline-block">
                    Overhead
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                  Cost Control • Overhead PG 1
                </span>
                {lastUpdated && (
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#65736B] font-medium leading-tight mt-0.5 truncate">
                    <Calendar className="w-3 h-3 text-[#16823B] shrink-0" />
                    <span className="font-semibold text-[#2C3830]">
                      {String(lastUpdated)}
                    </span>
                  </div>
                )}
              </div>
            </a>

            {/* Center Sub-Menu Navigation: OPEX PG1 & Antar PG */}
            {onSelectSection && (
              <div className="hidden md:flex items-center gap-1 bg-[#F8FAF9] border border-[#DDE5DF] p-1 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => onSelectSection("pg1")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
                    activeSection === "pg1"
                      ? "bg-white text-[#16823B] font-bold shadow-xs border border-[#CBE0D1]"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-white/60 font-semibold border border-transparent"
                  }`}
                  title="Direct ke Ringkasan & Detail OPEX PG1"
                >
                  <Building2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeSection === "pg1" ? "text-[#16823B]" : "text-[#89938D]"
                    }`}
                  />
                  <span>OPEX PG1</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSection("antar-pg")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
                    activeSection === "antar-pg"
                      ? "bg-white text-[#16823B] font-bold shadow-xs border border-[#CBE0D1]"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-white/60 font-semibold border border-transparent"
                  }`}
                  title="Direct ke Trend & Komparasi Cost Element Antar PG"
                >
                  <TrendingUp
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeSection === "antar-pg" ? "text-[#16823B]" : "text-[#89938D]"
                    }`}
                  />
                  <span>Komparasi Antar PG</span>
                </button>
              </div>
            )}

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <a
                href={portalUrl}
                className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs sm:text-sm transition-all shadow-xs"
                title="Buka Portal Utama untuk Memilih Komoditas Lain"
              >
                <LayoutGrid className="w-4 h-4 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>

              <a
                href={adminUrl}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                title="Buka Admin Pusat"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>

              {/* Hamburger Button for Mobile only (md:hidden) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                suppressHydrationWarning
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#17231B] transition-all shadow-2xs cursor-pointer active:scale-95"
                aria-label={mobileMenuOpen ? "Tutup Menu Modul Overhead" : "Buka Menu Modul Overhead"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#16823B]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#16823B]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Under Navbar, khusus 3 Modul Overhead) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#DDE5DF] bg-white px-3 sm:px-4 py-3.5 space-y-3 shadow-lg max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Sub-Menu Buttons */}
            {onSelectSection && (
              <div className="space-y-1.5 pb-2 border-b border-[#EAEFEB]">
                <div className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider px-1">
                  Navigasi Halaman OPEX
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("pg1");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeSection === "pg1"
                        ? "bg-[#16823B] text-white border-[#16823B] shadow-xs"
                        : "bg-[#F8FAF9] text-[#17231B] border-[#DDE5DF]"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>OPEX PG1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("antar-pg");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeSection === "antar-pg"
                        ? "bg-[#16823B] text-white border-[#16823B] shadow-xs"
                        : "bg-[#F8FAF9] text-[#17231B] border-[#DDE5DF]"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Antar PG</span>
                  </button>
                </div>
              </div>
            )}

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#5F6B63] uppercase tracking-wider px-1">
                <span>Modul Overhead & Fasilitas</span>
                <span className="text-[10px] text-[#16823B] font-semibold bg-[#EAF3EC] px-2 py-0.5 rounded border border-[#CBE0D1]">
                  3 Modul
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {overheadNavItems.map((item) => {
                  const isActive = item.key === "opex";
                  const isHosted = item.isHosted;
                  const Icon = item.icon;

                  if (!isHosted) {
                    return (
                      <div
                        key={item.key}
                        className="p-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-gray-50/70 border border-gray-200/60 select-none cursor-not-allowed flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="truncate">{item.label}</span>
                            <span className="text-[10px] text-gray-400 font-normal truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded font-medium shrink-0">
                          Pembuatan
                        </span>
                      </div>
                    );
                  }

                  return (
                    <a
                      key={item.key}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all border ${
                        isActive
                          ? "bg-[#EAF3EC] text-[#16823B] font-bold border-[#CBE0D1]"
                          : "text-[#2C3830] hover:bg-[#F8FAF9] border-[#EAEFEB]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#16823B]" : "text-[#5F6B63]"}`} />
                        <div className="flex flex-col truncate">
                          <span className="truncate">{item.label}</span>
                          <span className="text-[10px] text-[#5F6B63] font-normal truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[9px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                          Aktif
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Mobile Quick Links to Portal Utama & Admin */}
              <div className="pt-2 border-t border-[#EAEFEB] grid grid-cols-2 gap-2">
                <a
                  href={portalUrl}
                  className="w-full text-center py-2.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#5F6B63]" />
                  <span>Portal Utama</span>
                </a>
                <a
                  href={adminUrl}
                  className="w-full text-center py-2.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Admin Pusat</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 3. BACKDROP OVERLAY (Desktop only)                        */}
      {/* ========================================================= */}
      <div
        className={`hidden md:block fixed inset-0 bg-[#0c1a10]/50 backdrop-blur-xs z-[60] transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* 4. EXPANDED LEFT SIDEBAR DRAWER (Desktop only)            */}
      {/* ========================================================= */}
      <aside
        className={`hidden md:flex fixed top-0 bottom-0 left-0 w-80 sm:w-[340px] max-w-[90vw] bg-white z-[70] shadow-2xl flex-col border-r border-[#DDE5DF] transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi Menu Modul Overhead"
      >
        {/* Header of Expanded Sidebar */}
        <div className="p-4 sm:p-5 border-b border-[#DDE5DF] flex items-center justify-between bg-[#F8FAF9]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] flex items-center justify-center text-[#16823B] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[#17231B] leading-tight">
                  Overhead & Fasilitas
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                  3 Modul
                </span>
              </div>
              <p className="text-xs text-[#5F6B63] font-medium mt-0.5">
                Cost Control Overhead PG 1
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            suppressHydrationWarning
            className="p-2 text-[#5F6B63] hover:text-[#17231B] hover:bg-[#EAEFEB] rounded-xl transition-all cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar in Expanded Sidebar */}
        <div className="p-4 border-b border-[#EAEFEB] bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              placeholder="Cari modul overhead (capex, opex)..."
              className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] placeholder-[#89938D] focus:outline-none focus:ring-2 focus:ring-[#16823B]/30 focus:border-[#16823B] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                suppressHydrationWarning
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B] p-0.5"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Modul Overhead List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[11px] font-bold text-[#89938D] uppercase tracking-wider">
              Daftar Modul Overhead
            </span>
            <span className="text-[11px] text-[#5F6B63]">
              {filteredNavItems.length} dari {overheadNavItems.length}
            </span>
          </div>

          {filteredNavItems.length === 0 ? (
            <div className="py-8 text-center text-[#89938D] text-xs">
              Tidak ada modul yang cocok dengan &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const isActive = item.key === "opex";
              const isHosted = item.isHosted;
              const IconComponent = item.icon;

              if (!isHosted) {
                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 opacity-80 flex items-start gap-3 select-none"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-600 block">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-gray-400 block -mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          <Wrench className="w-2.5 h-2.5 text-amber-600" />
                          Pembuatan
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={item.key}
                  href={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`group p-3 rounded-xl border transition-all flex items-start gap-3 relative ${
                    isActive
                      ? "bg-[#EAF3EC] border-[#CBE0D1] text-[#16823B] shadow-2xs"
                      : "bg-white border-[#EAEFEB] hover:border-[#16823B]/40 hover:bg-[#F8FAF9] text-[#2C3830]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isActive
                        ? "bg-[#16823B] text-white shadow-xs"
                        : "bg-[#F8FAF9] text-[#5F6B63] group-hover:bg-[#EAF3EC] group-hover:text-[#16823B]"
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#5F6B63] block -mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                      {isActive ? (
                        <span className="text-[10px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                          Aktif
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#89938D] group-hover:text-[#16823B] group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] line-clamp-1 mt-1 ${
                        isActive ? "text-[#16823B]/80 font-medium" : "text-[#5F6B63]"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </a>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-[#DDE5DF] bg-[#F8FAF9] text-center text-[11px] text-[#89938D] font-medium shrink-0">
          © 2026 Great Giant Foods • Overhead PG 1
        </div>
      </aside>
    </>
  );
}
