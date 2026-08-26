"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, ExternalLink, Users, Layers, Activity, Database, CheckCircle2, Lock, KeyRound } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
  access: Record<string, string>;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Memverifikasi sesi Admin Pusat...</span>
        </div>
      </div>
    );
  }

  const dashboards = [
    {
      key: "wip",
      name: "Dashboard WIP (Cost Control)",
      desc: "Manajemen data lokasi, sbt, aktivitas, dan upload excel",
      url: "http://localhost:3000/admin",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      icon: Activity,
    },
    {
      key: "dashboard_a",
      name: "Dashboard A",
      desc: "Manajemen operasional & produksi wilayah A",
      url: "http://localhost:3002/admin",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
      icon: Layers,
    },
    {
      key: "dashboard_b",
      name: "Dashboard B",
      desc: "Manajemen logistik & pergerakan inventaris",
      url: "http://localhost:3003/admin",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
      icon: Database,
    },
    {
      key: "dashboard_c",
      name: "Dashboard C",
      desc: "Audit finansial & laporan eksekutif",
      url: "http://localhost:3004/admin",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Admin Pusat</h1>
              <span className="text-xs text-slate-400">GGF AgroMetric Central Governance</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user?.username}</div>
              <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                {user?.role}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all border border-slate-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-10">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Selamat Datang, <span className="text-emerald-400">{user?.username}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Anda telah berhasil masuk ke sistem Admin Pusat. Dari panel ini Anda dapat langsung mengelola dashboard yang diizinkan dan memantau status hak akses administrator.
          </p>
        </div>

        {/* Dashboard Access Cards */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Pilih Dashboard yang Dikelola
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboards.map((dash) => {
              const accessLevel = user?.access[dash.key] || "FULL"; // Default full for demo admin
              const IconComponent = dash.icon;
              const hasAccess = accessLevel !== "NONE";

              return (
                <div
                  key={dash.key}
                  className={`bg-gradient-to-br ${dash.color} bg-slate-900/60 border rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          hasAccess
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {hasAccess ? `Akses: ${accessLevel}` : "Tidak Ada Akses"}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-100 mb-1">{dash.name}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{dash.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Database: Terpisah</span>
                    {hasAccess ? (
                      <a
                        href={dash.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Kelola Dashboard <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Dibatasi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User & Access Governance Matrix */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Tata Kelola Admin & Hak Akses
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Data identitas administrator dipusatkan pada database `ggf_admin_db`.
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
              Central Auth Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Username Admin</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">WIP Cost Control</th>
                  <th className="px-4 py-3">Dashboard A</th>
                  <th className="px-4 py-3">Dashboard B</th>
                  <th className="px-4 py-3 rounded-r-lg">Dashboard C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="px-4 py-3 font-semibold text-emerald-400">admin</td>
                  <td className="px-4 py-3">SUPER_ADMIN</td>
                  <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">FULL</span></td>
                  <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">FULL</span></td>
                  <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">FULL</span></td>
                  <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">FULL</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
