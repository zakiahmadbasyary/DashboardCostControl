import { LayoutDashboard, ArrowLeft, Shield, ShieldCheck } from "lucide-react";

export default function DashboardCPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-8">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Dashboard C (Audit Finansial)</h1>
            <span className="text-xs text-slate-400">Akses Publik / Read-Only</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3005"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Ke Portal Utama
          </a>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
          >
            <ShieldCheck className="w-4 h-4" /> Admin Pusat
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto my-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Placeholder Dashboard C</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
          Aplikasi ini telah disiapkan dalam arsitektur Monorepo (`apps/dashboard-c`) dan menggunakan Database C terpisah. Sistem autentikasi admin dikendalikan oleh Admin Pusat.
        </p>
      </main>

      <footer className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        © 2026 GGF AgroMetric Platform — Dashboard C Workspace
      </footer>
    </div>
  );
}
