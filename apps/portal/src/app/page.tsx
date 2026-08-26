"use client";

import React from "react";
import { PublicNavbar, getDashboardNavConfig } from "@dashboard/shared-ui";
import {
  LineChart,
  BarChart3,
  Banknote,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function PortalHomePage() {
  const { wipAccUrl, wipPg1Url, hppPg1Url, hppM3Url, adminUrl } = getDashboardNavConfig();

  const publicDashboards = [
    {
      id: "wip-acc",
      name: "WIP ACC",
      subtitle: "Cost Control",
      description:
        "Monitoring Work in Process (WIP) costs untuk wilayah ACC. Melacak pengeluaran operasional harian dan efisiensi.",
      url: wipAccUrl,
      icon: LineChart,
    },
    {
      id: "wip-pg1",
      name: "WIP PG1",
      subtitle: "Operasional",
      description:
        "Analisis detail Work in Process untuk operasional PG1. Dilengkapi analisis varians dan pelacakan anggaran.",
      url: wipPg1Url,
      icon: BarChart3,
    },
    {
      id: "hpp-pg1",
      name: "HPP PG1",
      subtitle: "Inventaris & Logistik",
      description:
        "Pelacakan Harga Pokok Produksi (HPP) untuk PG1. Evaluasi biaya produksi akhir dengan standar historis.",
      url: hppPg1Url,
      icon: Banknote,
    },
    {
      id: "hpp-m3",
      name: "HPP M3",
      subtitle: "Audit Finansial",
      description:
        "Analisis Harga Pokok Produksi fasilitas M3. Fokus pada hasil material dan distribusi biaya tenaga kerja.",
      url: hppM3Url,
      icon: Landmark,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Shared Public Header / Navbar */}
      <PublicNavbar
        currentDashboard="portal"
        brandTitle="GGF AgroMetric"
        brandSubtitle="Enterprise Cost Control Platform"
        showPortalLink={false}
        showAdminLink={true}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title & Subtitle Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
            Portal Utama Monitoring Biaya
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] tracking-tight">
            Cost Control Dashboard Portal
          </h1>
          <p className="text-[#5F6B63] text-sm sm:text-base leading-relaxed">
            Portal terpusat untuk memantau, menganalisis, dan mengoptimalkan biaya produksi pertanian di seluruh wilayah operasional GGF.
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
                    <span className="text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] px-2 py-0.5 rounded-md inline-block mt-1">
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
