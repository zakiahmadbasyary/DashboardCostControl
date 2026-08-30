"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboardNavConfig } from "@dashboard/shared-ui";
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
  Trash2,
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

  const [clearingLogs, setClearingLogs] = useState(false);

  const handleResetLogs = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat log aktivitas? Aksi ini tidak dapat dibatalkan.")) {
      return;
    }

    setClearingLogs(true);
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus log aktivitas");
      }

      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClearingLogs(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === "users" && currentUser.role === "SUPER_ADMIN") {
      fetchUsers();
    } else if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, currentUser, fetchUsers, fetchLogs]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = "/login";
    }
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
      dashboardCodes: [],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (userToEdit: AdminUser) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      username: userToEdit.username,
      email: userToEdit.email,
      password: "",
      role: userToEdit.role,
      status: userToEdit.status,
      dashboardCodes: userToEdit.allowedDashboards || [],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const url = "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const payload: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        dashboardCodes: formData.role === "SUPER_ADMIN" ? [] : formData.dashboardCodes,
      };

      if (editingUser) {
        payload.id = editingUser.id;
      }

      if (formData.password) {
        payload.password = formData.password;
        payload.newPassword = formData.password;
      }

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
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center text-[#5F6B63]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#16823B] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Memverifikasi sesi Admin Pusat...</span>
        </div>
      </div>
    );
  }

  const {
    wipAccUrl,
    wipPg1Url,
    hppPg1Url,
    hppM3Url,
    wipAccAdminUrl,
    wipPg1AdminUrl,
    hppPg1AdminUrl,
    hppM3AdminUrl,
  } = getDashboardNavConfig();

  const allDashboardsConfig = [
    {
      code: "wip",
      name: "Dashboard WIP (Cost Control)",
      desc: "Manajemen data lokasi, sbt, aktivitas, dan upload excel cost control",
      url: wipAccUrl,
      adminUrl: wipAccAdminUrl,
      icon: Activity,
    },
    {
      code: "dashboard_a",
      name: "Dashboard A (Operasional)",
      desc: "Manajemen operasional & performa produksi wilayah A",
      url: wipPg1Url,
      adminUrl: wipPg1AdminUrl,
      icon: Layers,
    },
    {
      code: "dashboard_b",
      name: "Dashboard B (Inventaris)",
      desc: "Manajemen logistik & pergerakan inventaris sarana produksi",
      url: hppPg1Url,
      adminUrl: hppPg1AdminUrl,
      icon: Database,
    },
    {
      code: "dashboard_c",
      name: "Dashboard C (Finansial)",
      desc: "Audit finansial terpadu & laporan eksekutif",
      url: hppM3Url,
      adminUrl: hppM3AdminUrl,
      icon: Shield,
    },
  ];

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* Header Bar with Logo */}
      <header className="border-b border-[#DDE5DF] bg-white sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <a href="/dashboard" className="flex items-center gap-3 shrink-0 py-1 group">
            <div className="h-9 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-9 max-h-9 w-auto object-contain"
                style={{ height: "36px", maxHeight: "36px", width: "auto" }}
              />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg leading-none text-[#17231B] tracking-tight group-hover:text-[#16823B] transition-colors">
                Admin Pusat
              </h1>
              <span className="text-[10px] sm:text-xs text-[#5F6B63] font-medium hidden sm:block mt-0.5">
                GGF AgroMetric Platform Governance
              </span>
            </div>
          </a>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#17231B]">{currentUser?.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#5F6B63]">@{currentUser?.username}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                    isSuperAdmin
                      ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#F8FAF9] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#2C3830] transition-all border border-[#DDE5DF] flex items-center gap-1.5 text-xs font-semibold"
              title="Logout dari Admin Pusat"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner Section */}
        <div className="bg-white border border-[#DDE5DF] border-l-4 border-l-[#16823B] rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Satu Akun Single Sign-On (SSO) Terpusat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B] tracking-tight">
              Selamat Datang, <span className="text-[#16823B]">{currentUser?.name}</span>
            </h2>
            <p className="text-[#5F6B63] text-xs sm:text-sm max-w-2xl leading-relaxed">
              Anda terautentikasi sebagai <strong className="text-[#17231B]">{currentUser?.role}</strong>. Seluruh identitas administrator dikelola secara terpusat dari Admin Pusat.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#DDE5DF] shrink-0">
            <div className="text-right text-xs">
              <div className="text-[#5F6B63] font-medium">Akses Terdaftar</div>
              <div className="font-bold text-[#16823B]">
                {isSuperAdmin ? "Seluruh Dashboard (Super)" : `${currentUser?.allowedDashboards.length} Dashboard`}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#DDE5DF] pb-4">
          <button
            onClick={() => setActiveTab("dashboards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "dashboards"
                ? "bg-[#16823B] text-white shadow-2xs"
                : "bg-white hover:bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dashboard Saya</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "bg-white hover:bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen User & Hak Akses</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-[#16823B] text-white shadow-2xs"
                : "bg-white hover:bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Log Aktivitas</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD SAYA */}
        {activeTab === "dashboards" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#17231B]">Daftar Dashboard Platform</h3>
              <p className="text-[#5F6B63] text-xs mt-0.5">
                Klik "Kelola Dashboard" untuk membuka halaman administrasi masing-masing dashboard tanpa perlu login ulang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allDashboardsConfig.map((dash) => {
                const IconComponent = dash.icon;
                const hasAccess =
                  isSuperAdmin || currentUser?.allowedDashboards.includes(dash.code);

                return (
                  <div
                    key={dash.code}
                    className={`bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs transition-all ${
                      !hasAccess ? "opacity-60 bg-gray-50" : "hover:shadow-md hover:border-[#CBE0D1]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] flex items-center justify-center text-[#16823B]">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                            hasAccess
                              ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {hasAccess ? "Akses Diizinkan" : "Akses Dibatasi (403)"}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-extrabold text-[#17231B] mb-1">
                        {dash.name}
                      </h4>
                      <p className="text-[#5F6B63] text-xs leading-relaxed mb-6">{dash.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-[#EAEFEB] flex items-center justify-between">
                      <span className="text-[11px] text-[#89938D]">Database: Terpisah</span>
                      {hasAccess ? (
                        <a
                          href={dash.adminUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs transition-all shadow-2xs"
                        >
                          <span>Kelola Dashboard</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-[#89938D] flex items-center gap-1.5 bg-[#F8FAF9] px-3 py-1.5 rounded-xl border border-[#DDE5DF] font-semibold">
                          <Lock className="w-3.5 h-3.5 text-red-500" />
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
                <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#16823B]" /> Tata Kelola Administrator & Hak Akses
                </h3>
                <p className="text-[#5F6B63] text-xs mt-0.5">
                  Super Admin dapat menambah akun, mengubah role, menonaktifkan akun, dan menentukan dashboard mana yang boleh dikelola oleh Admin biasa.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-extrabold text-xs transition-all shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Administrator Baru</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12 text-[#5F6B63] text-xs font-medium">
                Memuat daftar pengguna admin...
              </div>
            ) : (
              <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAF9] text-[#5F6B63] uppercase font-semibold border-b border-[#DDE5DF]">
                      <tr>
                        <th className="px-6 py-4">Nama & Username</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Akses Dashboard</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFEB] text-[#17231B]">
                      {usersList.map((u) => {
                        const isSuper = u.role === "SUPER_ADMIN";
                        const isActive = u.status === "ACTIVE";

                        return (
                          <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#17231B]">{u.name}</div>
                              <div className="text-[11px] text-[#5F6B63] font-mono">@{u.username}</div>
                            </td>
                            <td className="px-6 py-4 text-[#2C3830]">{u.email}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded font-extrabold text-[10px] uppercase border ${
                                  isSuper
                                    ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isActive
                                    ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                <span>{u.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isSuper ? (
                                <span className="text-[11px] font-bold text-[#16823B]">
                                  Semua Dashboard (Akses Penuh)
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {u.allowedDashboards.length === 0 ? (
                                    <span className="text-[#89938D] italic">Tidak ada akses</span>
                                  ) : (
                                    u.allowedDashboards.map((code) => (
                                      <span
                                        key={code}
                                        className="text-[10px] bg-[#F8FAF9] text-[#2C3830] px-2 py-0.5 rounded border border-[#DDE5DF] font-mono uppercase"
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
                                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs transition-colors border border-[#DDE5DF] inline-flex items-center gap-1.5"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#5F6B63]" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#16823B]" /> Log Aktivitas Terpusat
                </h3>
                <p className="text-[#5F6B63] text-xs mt-0.5">
                  Riwayat aksi login, logout, pembuatan user, dan perubahan hak akses terpusat.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={handleResetLogs}
                  disabled={clearingLogs || logsList.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Bersihkan seluruh riwayat aktivitas"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>{clearingLogs ? "Membersihkan..." : "Reset / Hapus Log"}</span>
                </button>
              )}
            </div>

            {loadingLogs ? (
              <div className="text-center py-12 text-[#5F6B63] text-xs font-medium">
                Memuat log aktivitas...
              </div>
            ) : (
              <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAF9] text-[#5F6B63] uppercase font-semibold border-b border-[#DDE5DF]">
                      <tr>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Administrator</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Deskripsi Aktivitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFEB] text-[#2C3830]">
                      {logsList.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F8FAF9] transition-colors">
                          <td className="px-6 py-4 text-[#5F6B63] whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#17231B]">{log.user?.name || log.user?.username}</div>
                            <div className="text-[10px] text-[#5F6B63]">@{log.user?.username} ({log.user?.role})</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#2C3830]">{log.description}</td>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#DDE5DF] rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-4">
              <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#16823B]" />
                <span>{editingUser ? "Edit User & Hak Akses" : "Tambah Administrator Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F8FAF9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#2C3830] font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2C3830] font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white disabled:opacity-50"
                    placeholder="budi_admin"
                  />
                </div>

                <div>
                  <label className="block text-[#2C3830] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white"
                    placeholder="budi@ggf.co.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2C3830] font-semibold mb-1">
                  {editingUser ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2C3830] font-semibold mb-1">Role Utama</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "SUPER_ADMIN" | "ADMIN",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white"
                  >
                    <option value="ADMIN">ADMIN (Biasa)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2C3830] font-semibold mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ACTIVE" | "INACTIVE",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif)</option>
                    <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                  </select>
                </div>
              </div>

              {/* Dashboard Access Checkboxes */}
              {formData.role !== "SUPER_ADMIN" && (
                <div className="space-y-2 pt-2 border-t border-[#DDE5DF]">
                  <label className="block text-[#2C3830] font-semibold">
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
                              ? "bg-[#EAF3EC] border-[#CBE0D1] text-[#16823B]"
                              : "bg-[#F8FAF9] border-[#DDE5DF] text-[#5F6B63] hover:text-[#17231B]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDashboardCode(dash.code)}
                            className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-0"
                          />
                          <span className="font-semibold">{dash.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#DDE5DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAF9] hover:bg-gray-100 text-[#2C3830] font-semibold border border-[#DDE5DF]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold shadow-2xs disabled:opacity-50"
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
