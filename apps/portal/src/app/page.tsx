"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
import {
  LineChart,
  Banknote,
  Building2,
  Receipt,
  Droplets,
  Sprout,
  Tractor,
  Boxes,
  Truck,
  ShieldCheck,
  ArrowRight,
  Settings,
  Clock,
  Menu,
  X,
  Globe,
} from "lucide-react";

export default function PortalHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    portalUrl,
    mainEstatePortalUrl,
    wipAccUrl,
    hppUrl,
    capexUrl,
    opexUrl,
    irigasiUrl,
    sulamUrl,
    selesaiBongkarUrl,
    hargaMaterialUrl,
    pollPg1Url,
    adminUrl,
  } = getDashboardNavConfig();

  const publicDashboards = [
    {
      id: "wip",
      name: "WIP",
      subtitle: "Work In Process ACC",
      description:
        "Monitoring Work in Process (WIP) costs untuk setiap lokasi di PG1 yang diperoleh dari data accounting.",
      url: wipAccUrl,
      icon: LineChart,
      badge: "Cost Control",
      isHosted: true,
    },
    {
      id: "hpp",
      name: "HPP",
      subtitle: "Harga Pokok Produksi",
      description:
        "Pelacakan dan analisis Harga Pokok Produksi (HPP) akhir serta evaluasi efisiensi biaya produksi.",
      url: hppUrl,
      icon: Banknote,
      badge: "Produksi",
      isHosted: false,
    },
    {
      id: "capex",
      name: "Capex",
      subtitle: "Capital Expenditure",
      description:
        "Pengelolaan dan pengawasan pengeluaran belanja modal (Capital Expenditure) investasi & aset perusahaan.",
      url: capexUrl,
      icon: Building2,
      badge: "Belanja Modal",
      isHosted: false,
    },
    {
      id: "opex",
      name: "Opex",
      subtitle: "Operational Expenditure",
      description:
        "Monitoring dan pengendalian biaya operasional harian (Operational Expenditure) perkebunan.",
      url: opexUrl,
      icon: Receipt,
      badge: "Biaya Operasional",
      isHosted: false,
    },
    {
      id: "irigasi",
      name: "Irigasi",
      subtitle: "Pengairan & Pump",
      description:
        "Pengawasan biaya operasional pengairan, konsumsi air, dan infrastruktur sistem irigasi.",
      url: irigasiUrl,
      icon: Droplets,
      badge: "Fasilitas",
      isHosted: false,
    },
    {
      id: "sulam",
      name: "Sulam",
      subtitle: "Pemeliharaan Tanaman",
      description:
        "Monitoring biaya material pupuk/bibit dan efisiensi aktivitas penyulaman tanaman perkebunan.",
      url: sulamUrl,
      icon: Sprout,
      badge: "Pemeliharaan",
      isHosted: false,
    },
    {
      id: "selesai-bongkar",
      name: "Selesai Bongkar",
      subtitle: "Land Prep & Ratoon",
      description:
        "Evaluasi biaya, progres pengerjaan, dan pencatatan area pasca penyelesaian bongkar.",
      url: selesaiBongkarUrl,
      icon: Tractor,
      badge: "Land Prep",
      isHosted: false,
    },
    {
      id: "harga-material",
      name: "Harga Material",
      subtitle: "Master Data Logistik",
      description:
        "Pusat tracking harga master material, bahan baku, pupuk, serta fluktuasi logistik.",
      url: hargaMaterialUrl,
      icon: Boxes,
      badge: "Master Logistik",
      isHosted: false,
    },
    {
      id: "poll-pg1",
      name: "Poll PG 1",
      subtitle: "Armada & Transportasi",
      description:
        "Pengendalian biaya operasional pool armada PG1, efisiensi BBM, dan utilitas kendaraan.",
      url: pollPg1Url,
      icon: Truck,
      badge: "Armada PG1",
      isHosted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Dedicated Portal Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full">
        <div className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
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
                  Cost Control Dashboard Portal
                </span>
                <span className="text-[10px] sm:text-xs text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                  Sistem Informasi Manajemen Estate PG 1
                </span>
              </div>
            </a>

            {/* Desktop Action Buttons (Visible on sm and larger) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {/* Main Estate Portal Link */}
              <a
                href={mainEstatePortalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all shadow-xs"
                title="Kembali ke Portal Utama Estate PG 1 (Seluruh Sistem)"
              >
                <Globe className="w-3.5 h-3.5 text-[#16823B]" />
                <span>Portal Utama Estate</span>
              </a>

              {/* Toggle Dashboard Drawer */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all shadow-xs cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {menuOpen ? <X className="w-4 h-4 text-[#16823B]" /> : <Menu className="w-4 h-4 text-[#16823B]" />}
                <span>Daftar Dashboard</span>
              </button>

              <a
                href={adminUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs transition-all shadow-xs"
                title="Buka Admin Pusat"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>

            {/* Mobile Single Hamburger Menu Button (Visible ONLY on mobile < sm) */}
            <div className="sm:hidden flex items-center shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#17231B] transition-all shadow-xs focus:outline-none cursor-pointer flex items-center gap-1.5"
                aria-label="Menu Navigasi Mobile"
              >
                {menuOpen ? <X className="w-5 h-5 text-[#16823B]" /> : <Menu className="w-5 h-5 text-[#16823B]" />}
                <span className="text-xs font-bold text-[#17231B]">Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Dropdown Drawer */}
        {menuOpen && (
          <div className="border-t border-[#DDE5DF] bg-white px-4 py-4 shadow-lg animate-in fade-in duration-150">
            <div className="w-full max-w-[95%] mx-auto space-y-3">
              {/* Mobile Quick Links Section at Top of Drawer */}
              <div className="flex sm:hidden flex-col gap-2 pb-3 border-b border-[#EAEFEB]">
                <span className="text-[11px] font-extrabold text-[#17231B] uppercase tracking-wider">
                  Navigasi Utama
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={mainEstatePortalUrl}
                    className="py-2 px-2.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#16823B]" />
                    <span>Portal Estate</span>
                  </a>
                  <a
                    href={adminUrl}
                    className="py-2 px-2.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Admin Pusat</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-[#EAEFEB]">
                <span className="text-xs font-extrabold text-[#17231B] uppercase tracking-wider">
                  Daftar Dashboard Platform (9 Modul)
                </span>
                <span className="text-[11px] text-[#5F6B63] font-medium hidden sm:inline">
                  Pilih modul untuk berpindah aplikasi
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {publicDashboards.map((dash) => {
                  const Icon = dash.icon;
                  return (
                    <div key={dash.id}>
                      {dash.isHosted ? (
                        <a
                          href={dash.url}
                          onClick={() => setMenuOpen(false)}
                          className="p-3 rounded-xl border border-[#DDE5DF] hover:border-[#16823B] bg-white hover:bg-[#F4F9F5] transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#EAF3EC] text-[#16823B] group-hover:bg-[#16823B] group-hover:text-white transition-colors shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#17231B] group-hover:text-[#16823B] transition-colors">
                                {dash.name}
                              </div>
                              <div className="text-[10px] text-[#5F6B63] font-medium">{dash.subtitle}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FCE27A] text-[#17231B] shrink-0">
                            Buka
                          </span>
                        </a>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 flex items-center justify-between select-none">
                          <div className="flex items-center gap-3 opacity-60">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#17231B]">{dash.name}</div>
                              <div className="text-[10px] text-[#5F6B63]">{dash.subtitle}</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                            Pembuatan
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
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
            Portal terpusat untuk memantau, menganalisis, dan mengoptimalkan biaya operasional &amp; produksi di Plantation Group 1 - Great Giant Pineapple.
          </p>
        </div>

        {/* Dashboards Grid (9 Menu - 3 Kolom Utama) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {publicDashboards.map((dash) => {
            const IconComponent = dash.icon;
            return (
              <div
                key={dash.id}
                className={`bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs transition-all ${
                  !dash.isHosted ? "bg-slate-50/50" : "hover:shadow-md hover:border-[#CBE0D1] group"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      dash.isHosted
                        ? "bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]"
                        : "bg-amber-50 border border-amber-200/80 text-amber-700"
                    }`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block ${
                      dash.isHosted
                        ? "text-[#17231B] bg-[#FCE27A]/90"
                        : "text-amber-800 bg-amber-100/90 border border-amber-200"
                    }`}>
                      {dash.isHosted ? dash.badge : "Tahap Pembuatan"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-[#17231B] tracking-tight leading-snug">
                      {dash.name}
                    </h2>
                    <p className="text-xs font-semibold text-[#16823B] mt-0.5">
                      {dash.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-[#5F6B63] leading-relaxed mb-6 mt-3">
                    {dash.description}
                  </p>
                </div>

                <div>
                  {dash.isHosted ? (
                    <a
                      href={dash.url}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:shadow-xs"
                    >
                      <span>Buka Menu {dash.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="relative group/btn">
                      <button
                        disabled
                        onClick={(e) => e.preventDefault()}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#F0F4F1] border border-[#D0DDD4] text-[#7A8A7F] font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none"
                      >
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Tahap Pembuatan</span>
                      </button>
                      <div className="absolute hidden group-hover/btn:block bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md whitespace-nowrap -top-9 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        Masih Pembuatan
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                      </div>
                    </div>
                  )}
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
        <div className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 GGF AgroMetric Platform. Enterprise Cost Control Portal.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 font-medium text-[#17231B]">
            {publicDashboards.map((dash) => (
              dash.isHosted ? (
                <a key={dash.id} href={dash.url} className="hover:text-[#16823B]">
                  {dash.name}
                </a>
              ) : (
                <span key={dash.id} className="text-gray-400 cursor-not-allowed" title="Tahap Pembuatan">
                  {dash.name}
                </span>
              )
            ))}
            <a href={adminUrl} className="hover:text-[#16823B]">Admin Pusat</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

