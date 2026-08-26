"use client";

import React from "react";
import { PublicNavbar } from "@dashboard/shared-ui";
import { Database } from "lucide-react";

export default function DashboardAPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Shared Public Header */}
      <PublicNavbar
        currentDashboard="dashboard_a"
        brandTitle="GGF AgroMetric"
        brandSubtitle="Dashboard WIP PG1"
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto my-12 text-center space-y-6 px-4 flex-1">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center mx-auto shadow-2xs">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#17231B]">Dashboard WIP PG1 (Operasional)</h2>
        <p className="text-[#5F6B63] text-sm leading-relaxed max-w-xl mx-auto">
          Aplikasi ini disiapkan untuk modul Operasional & Performa Produksi wilayah PG1. Menggunakan database terpisah dan mengonsumsi header navigasi terpusat.
        </p>
      </main>

      <footer className="text-center text-xs text-[#5F6B63] border-t border-[#DDE5DF] bg-white py-6">
        © 2026 GGF AgroMetric Platform — Dashboard WIP PG1 Workspace
      </footer>
    </div>
  );
}
