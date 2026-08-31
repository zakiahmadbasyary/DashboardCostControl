"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import {
  LineChart,
  BarChart3,
  Banknote,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function PortalHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    portalUrl,
    wipAccUrl,
    wipPg1Url,
    hppPg1Url,
    hppM3Url,
    adminUrl,
    wipAccAdminUrl,
    wipPg1AdminUrl,
    hppPg1AdminUrl,
    hppM3AdminUrl,
  } = getDashboardNavConfig();

  const publicDashboards = [
    {
      id: "wip-acc",
      name: "WIP ACC",
      subtitle: "Cost Control",
      description:
        "Monitoring Work in Process (WIP) costs untuk setiap lokasi di PG1 yang dimana datanya diperoleh dari data accounting",
      url: wipAccUrl,
      adminUrl: wipAccAdminUrl,
      icon: LineChart,
    },
    {
      id: "wip-pg1",
      name: "WIP PG1",
      subtitle: "Operasional",
      description:
        "Analisis detail Work in Process untuk operasional PG1 yang dimana data diupdate mingguan",
      url: wipPg1Url,
      adminUrl: wipPg1AdminUrl,
      icon: BarChart3,
    },
    {
      id: "hpp-pg1",
      name: "HPP PG1",
      subtitle: "Inventaris & Logistik",
      description:
        "Pelacakan Harga Pokok Produksi (HPP) untuk PG1. Evaluasi biaya produksi akhir dengan standar historis.",
      url: hppPg1Url,
      adminUrl: hppPg1AdminUrl,
      icon: Banknote,
    },
    {
      id: "hpp-m3",
      name: "HPP M3",
      subtitle: "Audit Finansial",
      description:
        "Analisis Harga Pokok Produksi fasilitas M3. Fokus pada hasil material dan distribusi biaya tenaga kerja.",
      url: hppM3Url,
      adminUrl: hppM3AdminUrl,
      icon: Landmark,
    },
  ];

  const navItems = [
    { label: "WIP ACC", url: wipAccUrl },
    { label: "WIP PG1", url: wipPg1Url },
    { label: "HPP PG1", url: hppPg1Url },
    { label: "HPP M3", url: hppM3Url },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Dedicated Portal Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-18 flex items-center justify-between gap-4">
            {/* Left Brand Logo & Title */}
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
                  Plantation Group 1
                </span>
                <span className="text-[10px] sm:text-xs text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                  Cost Control Dashboard Portal
                </span>
              </div>
            </a>

            {/* Center Navigation Links (Horizontal Row on Desktop/Tablet) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9] transition-all whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Action: Admin Pusat Link */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <a
                href={adminUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>

            {/* Mobile Hamburger Toggle (< md) */}
            <div className="flex md:hidden items-center gap-2">
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#DDE5DF] bg-white px-4 py-3 space-y-2 shadow-lg">
            <div className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider mb-1 px-1">
              Navigasi Dashboard
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#2C3830] hover:bg-[#F8FAF9] flex items-center justify-between"
                >
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-[#E3EBE5]">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title & Subtitle Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="GGF Logo"
              className="h-16 sm:h-20 max-h-20 w-auto object-contain"
              style={{ height: "72px", maxHeight: "80px", width: "auto" }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] tracking-tight">
            Cost Control Dashboard Portal
          </h1>
          <p className="text-[#5F6B63] text-sm sm:text-base leading-relaxed">
            Portal terpusat untuk memantau, menganalisis, dan mengoptimalkan biaya produksi di Plantation Group 1 - Great Giant Pineapple.
          </p>
        </div>

        {/* Dashboards Grid (4 Kolom Utama) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {publicDashboards.map((dash) => {
            const IconComponent = dash.icon;
            return (
              <div
                key={dash.id}
                className="bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#CBE0D1] transition-all group"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center mb-4 shrink-0 shadow-2xs">
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>

                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-[#17231B] tracking-tight leading-snug">
                      {dash.name}
                    </h2>
                    <span className="text-[11px] font-bold text-[#17231B] bg-[#FCE27A]/90 px-2.5 py-0.5 rounded-md inline-block mt-1">
                      {dash.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6B63] leading-relaxed mb-6 mt-3">
                    {dash.description}
                  </p>
                </div>

                <div>
                  <a
                    href={dash.url}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Buka Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner Admin Pusat */}
        <div className="bg-white border border-[#DDE5DF] border-l-4 border-l-[#16823B] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center shrink-0 shadow-2xs mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17231B] mb-1">
                Admin Pusat
              </h3>
              <p className="text-xs text-[#5F6B63] leading-relaxed max-w-2xl">
                Pusat administrasi sistem. Kelola hak akses pengguna, master data sistem, unggah data Excel, dan aktivitas sistem terpusat.
              </p>
            </div>
          </div>

          <a
            href={adminUrl}
            className="whitespace-nowrap py-2.5 px-5 rounded-xl bg-white border border-[#16823B] hover:bg-[#F4F9F5] text-[#16823B] font-semibold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>Kelola Sistem Admin</span>
            <Settings className="w-4 h-4 text-[#16823B]" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GGF AgroMetric Platform. Enterprise Cost Control Portal.</p>
          <div className="flex flex-wrap justify-center gap-6 font-medium text-[#17231B]">
            <a href={wipAccUrl} className="hover:text-[#16823B]">WIP ACC</a>
            <a href={wipPg1Url} className="hover:text-[#16823B]">WIP PG1</a>
            <a href={hppPg1Url} className="hover:text-[#16823B]">HPP PG1</a>
            <a href={hppM3Url} className="hover:text-[#16823B]">HPP M3</a>
            <a href={adminUrl} className="hover:text-[#16823B]">Admin Pusat</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
