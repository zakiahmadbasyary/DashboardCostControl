"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  ExternalLink,
  Users,
  Layers,
  Activity,
  Database,
  Lock,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  allowedDashboards: string[];
}

interface DashboardItem {
  id: string;
  code: string;
  name: string;
  adminUrl: string;
  publicUrl: string;
  status: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  user: {
    username: string;
    name: string;
    role: string;
  };
}

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboards" | "users" | "logs">("dashboards");
  const router = useRouter();

  // User management states
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [dashboardsList, setDashboardsList] = useState<DashboardItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "ADMIN" as "SUPER_ADMIN" | "ADMIN",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    dashboardCodes: [] as string[],
  });
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Activity logs state
  const [logsList, setLogsList] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Verify auth session
  useEffect(() => {
    fetch("/api/auth/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  // Fetch users & dashboards (for Super Admin)
  const fetchUsers = useCallback(async () => {
    if (currentUser?.role !== "SUPER_ADMIN") return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
        setDashboardsList(data.dashboards || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.role]);

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogsList(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users" && currentUser?.role === "SUPER_ADMIN") {
      fetchUsers();
    } else if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, currentUser?.role, fetchUsers, fetchLogs]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
      dashboardCodes: ["wip"],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      dashboardCodes: user.allowedDashboards.includes("ALL")
        ? ["wip", "dashboard_a", "dashboard_b", "dashboard_c"]
        : user.allowedDashboards,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const isEdit = Boolean(editingUser);
      const url = "/api/users";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { id: editingUser?.id, ...formData, newPassword: formData.password }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data user");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDashboardCode = (code: string) => {
    setFormData((prev) => {
      const exists = prev.dashboardCodes.includes(code);
      return {
        ...prev,
        dashboardCodes: exists
          ? prev.dashboardCodes.filter((c) => c !== code)
          : [...prev.dashboardCodes, code],
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Memverifikasi sesi Admin Pusat...</span>
        </div>
      </div>
    );
  }

  const allDashboardsConfig = [
    {
      code: "wip",
      name: "Dashboard WIP (Cost Control)",
      desc: "Manajemen data lokasi, sbt, aktivitas, dan upload excel cost control",
      url: "http://localhost:3000/admin",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      icon: Activity,
    },
    {
      code: "dashboard_a",
      name: "Dashboard A (Operasional)",
      desc: "Manajemen operasional & performa produksi wilayah A",
      url: "http://localhost:3002/admin",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
      icon: Layers,
    },
    {
      code: "dashboard_b",
      name: "Dashboard B (Inventaris)",
      desc: "Manajemen logistik & pergerakan inventaris sarana produksi",
      url: "http://localhost:3003/admin",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
      icon: Database,
    },
    {
      code: "dashboard_c",
      name: "Dashboard C (Finansial)",
      desc: "Audit finansial terpadu & laporan eksekutif",
      url: "http://localhost:3004/admin",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
      icon: Shield,
    },
  ];

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-none text-white tracking-tight">
                Admin Pusat
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">
                GGF AgroMetric Multi-Dashboard Governance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{currentUser?.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400">@{currentUser?.username}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                    isSuperAdmin
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all border border-slate-700 flex items-center gap-2 text-xs font-semibold"
              title="Logout dari Admin Pusat"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Satu Akun Single Sign-On (SSO) Terpusat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Selamat Datang, <span className="text-emerald-400">{currentUser?.name}</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Anda terautentikasi sebagai <strong className="text-slate-200">{currentUser?.role}</strong>. Seluruh identitas administrator dikelola secara terpusat dari Admin Pusat.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-right text-xs">
              <div className="text-slate-400">Akses Terdaftar</div>
              <div className="font-bold text-emerald-400">
                {isSuperAdmin ? "Seluruh Dashboard (Super)" : `${currentUser?.allowedDashboards.length} Dashboard`}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("dashboards")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "dashboards"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dashboard Saya</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen User & Hak Akses</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Log Aktivitas</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD SAYA */}
        {activeTab === "dashboards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Daftar Dashboard Platform</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Klik "Kelola Dashboard" untuk membuka halaman administrasi masing-masing dashboard tanpa perlu login ulang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allDashboardsConfig.map((dash) => {
                const IconComponent = dash.icon;
                const hasAccess =
                  isSuperAdmin || currentUser?.allowedDashboards.includes(dash.code);

                return (
                  <div
                    key={dash.code}
                    className={`bg-gradient-to-br ${dash.color} bg-slate-900/60 border rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all ${
                      !hasAccess ? "opacity-60 border-slate-800" : "hover:border-emerald-500/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                            hasAccess
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {hasAccess ? "Akses Diizinkan" : "Akses Dibatasi (403)"}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-extrabold text-slate-100 mb-1">
                        {dash.name}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6">{dash.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Database: Terpisah</span>
                      {hasAccess ? (
                        <a
                          href={dash.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                        >
                          <span>Kelola Dashboard</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold">
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          <span>Dibatasi Server</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN USER (KHUSUS SUPER ADMIN) */}
        {activeTab === "users" && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Tata Kelola Administrator & Hak Akses
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Super Admin dapat menambah akun, mengubah role, menonaktifkan akun, dan menentukan dashboard mana yang boleh dikelola oleh Admin biasa.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Administrator Baru</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Memuat daftar pengguna admin...
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Nama & Username</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Akses Dashboard</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {usersList.map((u) => {
                        const isSuper = u.role === "SUPER_ADMIN";
                        const isActive = u.status === "ACTIVE";

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{u.email}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded font-extrabold text-[10px] uppercase border ${
                                  isSuper
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                <span>{u.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isSuper ? (
                                <span className="text-[11px] font-bold text-emerald-400">
                                  Semua Dashboard (Akses Penuh)
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {u.allowedDashboards.length === 0 ? (
                                    <span className="text-slate-500 italic">Tidak ada akses</span>
                                  ) : (
                                    u.allowedDashboards.map((code) => (
                                      <span
                                        key={code}
                                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono uppercase"
                                      >
                                        {code}
                                      </span>
                                    ))
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 inline-flex items-center gap-1.5"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LOG AKTIVITAS */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" /> Log Aktivitas Terpusat
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Riwayat aksi login, logout, pembuatan user, dan perubahan hak akses terpusat.
              </p>
            </div>

            {loadingLogs ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Memuat log aktivitas...
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Administrator</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Deskripsi Aktivitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {logsList.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{log.user?.name || log.user?.username}</div>
                            <div className="text-[10px] text-slate-400">@{log.user?.username} ({log.user?.role})</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL USER FORM (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingUser ? "Edit User & Hak Akses" : "Tambah Administrator Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                    placeholder="budi_admin"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    placeholder="budi@ggf.co.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {editingUser ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Utama</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "SUPER_ADMIN" | "ADMIN",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ADMIN">ADMIN (Biasa)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ACTIVE" | "INACTIVE",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif)</option>
                    <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                  </select>
                </div>
              </div>

              {/* Dashboard Access Checkboxes */}
              {formData.role !== "SUPER_ADMIN" && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-semibold">
                    Alokasi Akses Dashboard (Role Admin)
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: "wip", label: "Dashboard WIP" },
                      { code: "dashboard_a", label: "Dashboard A" },
                      { code: "dashboard_b", label: "Dashboard B" },
                      { code: "dashboard_c", label: "Dashboard C" },
                    ].map((dash) => {
                      const isChecked = formData.dashboardCodes.includes(dash.code);
                      return (
                        <label
                          key={dash.code}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDashboardCode(dash.code)}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                          />
                          <span className="font-semibold">{dash.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
