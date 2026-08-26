import { PublicNavbar } from "@dashboard/shared-ui";
import { LayoutDashboard, ShieldCheck, Database, Layers, ExternalLink, Activity, ArrowRight } from "lucide-react";

export default function PortalHomePage() {
  const dashboards = [
    {
      id: "wip",
      name: "Dashboard WIP ACC (Cost Control)",
      description: "Monitoring Work In Progress, analisis biaya lokasi, sbt, dan aktivitas lapangan secara real-time.",
      status: "Aktif / Production",
      url: "http://localhost:3000",
      badge: "Utama",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: Activity,
    },
    {
      id: "dashboard-a",
      name: "Dashboard WIP PG1 (Operasional)",
      description: "Modul analisis operasional & performa produksi wilayah A.",
      status: "Pengembangan",
      url: "http://localhost:3002",
      badge: "Rencana",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: Layers,
    },
    {
      id: "dashboard-b",
      name: "Dashboard HPP PG1 (Logistik)",
      description: "Modul manajemen inventaris & logistik terintegrasi.",
      status: "Pengembangan",
      url: "http://localhost:3003",
      badge: "Rencana",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: Database,
    },
    {
      id: "dashboard-c",
      name: "Dashboard HPP M3 (Finansial)",
      description: "Modul pelaporan eksekutif & audit finansial.",
      status: "Pengembangan",
      url: "http://localhost:3004",
      badge: "Rencana",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Shared Public Header / Navbar */}
      <PublicNavbar
        currentDashboard="portal"
        brandTitle="GGF AgroMetric"
        brandSubtitle="Enterprise Dashboard Portal"
        showPortalLink={false}
        showAdminLink={true}
      />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Monorepo Architecture Online
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Pusat Layanan <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Dashboard Analytics</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Akses seluruh dashboard operasional dan finansial secara langsung tanpa login. Kelola autentikasi dan otorisasi secara terpusat melalui Admin Pusat.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {dashboards.map((dash) => {
            const IconComponent = dash.icon;
            return (
              <div
                key={dash.id}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${dash.badgeColor}`}>
                      {dash.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mb-2">
                    {dash.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {dash.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    {dash.status}
                  </span>

                  <a
                    href={dash.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-all"
                  >
                    Buka Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Admin Info Box */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Akses Administrator Pusat
            </div>
            <h3 className="text-2xl font-bold text-white">Memerlukan Hak Akses Pengelolaan Data?</h3>
            <p className="text-slate-400 text-sm max-w-2xl">
              Login melalui Admin Pusat untuk mengelola data bisnis WIP, mengatur pengguna administrator, serta mengalokasikan hak akses dashboard.
            </p>
          </div>

          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            Masuk Admin Pusat <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GGF AgroMetric Platform. Monorepo Architecture.</p>
          <div className="flex gap-6">
            <span>WIP ACC</span>
            <span>WIP PG1</span>
            <span>HPP PG1</span>
            <span>HPP M3</span>
            <span>Admin Pusat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
