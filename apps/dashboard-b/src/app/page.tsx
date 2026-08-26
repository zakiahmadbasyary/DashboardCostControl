"use client";

import { Database, Layers } from "lucide-react";
import { PublicNavbar } from "@dashboard/shared-ui";

export default function DashboardBPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Shared Public Navbar */}
      <PublicNavbar
        currentDashboard="dashboard_b"
        brandTitle="Dashboard B"
        brandSubtitle="Manajemen Inventaris & Logistik"
      />

      {/* Public Dashboard Body */}
      <main className="max-w-4xl mx-auto my-12 text-center space-y-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Dashboard B (Inventaris & Logistik)</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
          Aplikasi ini disiapkan untuk modul Logistik & Pergerakan Inventaris. Menggunakan database terpisah dan mengonsumsi komponen shared PublicNavbar untuk navigasi publik antar-dashboard.
        </p>
      </main>

      <footer className="text-center text-xs text-slate-500 border-t border-slate-800 py-6">
        © 2026 GGF AgroMetric Platform — Dashboard B Workspace
      </footer>
    </div>
  );
}
