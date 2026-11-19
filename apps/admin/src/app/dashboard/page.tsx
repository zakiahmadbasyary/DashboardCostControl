"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Banknote,
  Building2,
  Receipt,
  Droplets,
  Sprout,
  Tractor,
  Boxes,
  Truck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Citrus,
  Leaf,
  Search,
  Filter,
} from "lucide-react";

type CategoryId = "nanas" | "pepaya" | "othercrop" | "bibit" | "overhead";

interface CategoryMeta {
  id: CategoryId;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

interface AdminDashboardModule {
  code: string;
  category: CategoryId;
  categoryName: string;
  name: string;
  subtitle: string;
  desc: string;
  url: string;
  adminUrl: string;
  icon: React.ElementType;
  isHosted: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  allowedDashboards: string[];
}

interface ActivityLog {
  id: string;
  action: string;
  dashboardCode?: string;
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

  // State navigasi 2 tahap pada Tab Dashboard Saya (null = Pilihan Kategori, CategoryId = Modul Terpilih)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  // User management states
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

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
  const [clearingLogs, setClearingLogs] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("all");

  // SSO loading state
  const [ssoLoadingCode, setSsoLoadingCode] = useState<string | null>(null);

  const {
    wipAccUrl,
    hppUrl,
    capexUrl,
    opexUrl,
    irigasiUrl,
    sulamUrl,
    weedControlUrl,
    hargaMaterialUrl,
    pollPg1Url,
    wipAccAdminUrl,
    hppPg1AdminUrl,
  } = getDashboardNavConfig();

  const pepayaBaseUrl = process.env.NEXT_PUBLIC_PEPAYA_URL || "http://localhost:3011";
  const otherCropBaseUrl = process.env.NEXT_PUBLIC_OTHER_CROP_URL || "http://localhost:3012";
  const bibitBaseUrl = process.env.NEXT_PUBLIC_BIBIT_URL || "http://localhost:3013";

  // Definisi 5 Kategori
  const categories: CategoryMeta[] = useMemo(
    () => [
      {
        id: "nanas",
        name: "Nanas",
        subtitle: "Perkebunan Nanas PG 1",
        description:
          "Manajemen data WIP, HPP, master harga material, weed control, irigasi, dan sulam kebun nanas.",
        icon: Sprout,
      },
      {
        id: "pepaya",
        name: "Pepaya",
        subtitle: "Perkebunan Pepaya PG 1",
        description:
          "Pengelolaan data operasional WIP, perhitungan HPP panen, dan evaluasi sulam kebun pepaya.",
        icon: Citrus,
      },
      {
        id: "othercrop",
        name: "OtherCrop",
        subtitle: "Aneka Tanaman & Hortikultura",
        description:
          "Manajemen data operasional WIP, HPP produksi, dan evaluasi sulam komoditas hortikultura.",
        icon: Leaf,
      },
      {
        id: "bibit",
        name: "Bibit",
        subtitle: "Divisi Nursery & Storing Bibit",
        description:
          "Manajemen biaya WIP dan HPP pembibitan sucker serta fasilitas penanganan storing bibit.",
        icon: Layers,
      },
      {
        id: "overhead",
        name: "Overhead",
        subtitle: "Biaya Umum & Fasilitas",
        description:
          "Pengelolaan belanja modal (CAPEX), operasional harian (OPEX), dan operasional armada (POL PG1).",
        icon: Building2,
      },
    ],
    []
  );

  // Definisi Lengkap 19 Modul Dashboard
  const allDashboardsConfig: AdminDashboardModule[] = useMemo(
    () => [
      // ── 1. NANAS (6 Modul) ──
      {
        code: "wip",
        category: "nanas",
        categoryName: "Nanas",
        name: "WIP",
        subtitle: "Work In Process ACC",
        desc: "Manajemen data lokasi, sbt, aktivitas, dan upload excel cost control nanas",
        url: wipAccUrl,
        adminUrl: wipAccAdminUrl,
        icon: Activity,
        isHosted: true,
      },
      {
        code: "hpp",
        category: "nanas",
        categoryName: "Nanas",
        name: "HPP",
        subtitle: "Harga Pokok Produksi",
        desc: "Pelacakan & analisis Harga Pokok Produksi (HPP) akhir produksi nanas",
        url: hppUrl,
        adminUrl: hppPg1AdminUrl,
        icon: Banknote,
        isHosted: true,
      },
      {
        code: "harga_material",
        category: "nanas",
        categoryName: "Nanas",
        name: "Harga Material",
        subtitle: "Master Data Logistik",
        desc: "Pusat informasi harga master material, pupuk & fluktuasi logistik",
        url: hargaMaterialUrl,
        adminUrl: `${hargaMaterialUrl}/admin`,
        icon: Boxes,
        isHosted: true,
      },
      {
        code: "weed_control",
        category: "nanas",
        categoryName: "Nanas",
        name: "Evaluasi Weed Control",
        subtitle: "Pengendalian Gulma",
        desc: "Monitoring biaya penyiangan gulma & aplikasi herbisida kebun nanas",
        url: weedControlUrl,
        adminUrl: `${weedControlUrl}/admin`,
        icon: Tractor,
        isHosted: true,
      },
      {
        code: "irigasi",
        category: "nanas",
        categoryName: "Nanas",
        name: "Evaluasi Irigasi",
        subtitle: "Pengairan & Pump",
        desc: "Pengawasan biaya operasional pengairan & infrastruktur pompa kebun",
        url: irigasiUrl,
        adminUrl: `${irigasiUrl}/admin`,
        icon: Droplets,
        isHosted: false,
      },
      {
        code: "sulam",
        category: "nanas",
        categoryName: "Nanas",
        name: "Evaluasi Sulam",
        subtitle: "Pemeliharaan Tanaman",
        desc: "Monitoring biaya material pupuk/bibit & evaluasi penyulaman nanas",
        url: sulamUrl,
        adminUrl: `${sulamUrl}/admin`,
        icon: Sprout,
        isHosted: true,
      },

      // ── 2. PEPAYA (3 Modul) ──
      {
        code: "pepaya_wip",
        category: "pepaya",
        categoryName: "Pepaya",
        name: "WIP",
        subtitle: "Work In Process Pepaya",
        desc: "Pengelolaan data aktivitas dan biaya pemeliharaan kebun pepaya",
        url: `${pepayaBaseUrl}/wip`,
        adminUrl: `${pepayaBaseUrl}/admin/wip`,
        icon: Activity,
        isHosted: false,
      },
      {
        code: "pepaya_hpp",
        category: "pepaya",
        categoryName: "Pepaya",
        name: "HPP",
        subtitle: "Harga Pokok Produksi Pepaya",
        desc: "Kalkulasi HPP panen dan evaluasi efisiensi produksi pepaya",
        url: `${pepayaBaseUrl}/hpp`,
        adminUrl: `${pepayaBaseUrl}/admin/hpp`,
        icon: Banknote,
        isHosted: false,
      },
      {
        code: "pepaya_sulam",
        category: "pepaya",
        categoryName: "Pepaya",
        name: "Evaluasi Sulam",
        subtitle: "Penyulaman Kebun Pepaya",
        desc: "Pengawasan biaya penggunaan bibit dan tenaga kerja sulam pepaya",
        url: `${pepayaBaseUrl}/sulam`,
        adminUrl: `${pepayaBaseUrl}/admin/sulam`,
        icon: Sprout,
        isHosted: false,
      },

      // ── 3. OTHERCROP (3 Modul) ──
      {
        code: "othercrop_wip",
        category: "othercrop",
        categoryName: "OtherCrop",
        name: "WIP",
        subtitle: "Work In Process OtherCrop",
        desc: "Manajemen data perawatan dan operasional tanaman hortikultura lainnya",
        url: `${otherCropBaseUrl}/wip`,
        adminUrl: `${otherCropBaseUrl}/admin/wip`,
        icon: Activity,
        isHosted: false,
      },
      {
        code: "othercrop_hpp",
        category: "othercrop",
        categoryName: "OtherCrop",
        name: "HPP",
        subtitle: "Harga Pokok Produksi OtherCrop",
        desc: "Kalkulasi HPP panen dan analisis biaya aneka komoditas tanaman",
        url: `${otherCropBaseUrl}/hpp`,
        adminUrl: `${otherCropBaseUrl}/admin/hpp`,
        icon: Banknote,
        isHosted: false,
      },
      {
        code: "othercrop_sulam",
        category: "othercrop",
        categoryName: "OtherCrop",
        name: "Evaluasi Sulam",
        subtitle: "Penyulaman OtherCrop",
        desc: "Monitoring biaya sulam dan bahan bibit untuk komoditas hortikultura",
        url: `${otherCropBaseUrl}/sulam`,
        adminUrl: `${otherCropBaseUrl}/admin/sulam`,
        icon: Sprout,
        isHosted: false,
      },

      // ── 4. BIBIT (4 Modul) ──
      {
        code: "bibit_wip_sucker",
        category: "bibit",
        categoryName: "Bibit",
        name: "WIP Sucker",
        subtitle: "Work In Process Sucker",
        desc: "Pengendalian biaya penyediaan lahan & persiapan bibit sucker",
        url: `${bibitBaseUrl}/wip-sucker`,
        adminUrl: `${bibitBaseUrl}/admin/wip-sucker`,
        icon: Activity,
        isHosted: false,
      },
      {
        code: "bibit_hpp_sucker",
        category: "bibit",
        categoryName: "Bibit",
        name: "HPP Sucker",
        subtitle: "Harga Pokok Produksi Sucker",
        desc: "Perhitungan HPP bibit sucker siap distribusi dan tanam",
        url: `${bibitBaseUrl}/hpp-sucker`,
        adminUrl: `${bibitBaseUrl}/admin/hpp-sucker`,
        icon: Banknote,
        isHosted: false,
      },
      {
        code: "bibit_wip_storing",
        category: "bibit",
        categoryName: "Bibit",
        name: "WIP Storing",
        subtitle: "Work In Process Storing Bibit",
        desc: "Monitoring biaya fasilitas penyimpanan & karantina bibit",
        url: `${bibitBaseUrl}/wip-storing`,
        adminUrl: `${bibitBaseUrl}/admin/wip-storing`,
        icon: Boxes,
        isHosted: false,
      },
      {
        code: "bibit_hpp_storing",
        category: "bibit",
        categoryName: "Bibit",
        name: "HPP Storing",
        subtitle: "Harga Pokok Storing Bibit",
        desc: "Analisis total biaya penanganan bibit sebelum didistribusikan",
        url: `${bibitBaseUrl}/hpp-storing`,
        adminUrl: `${bibitBaseUrl}/admin/hpp-storing`,
        icon: Banknote,
        isHosted: false,
      },

      // ── 5. OVERHEAD (3 Modul) ──
      {
        code: "capex",
        category: "overhead",
        categoryName: "Overhead",
        name: "CAPEX",
        subtitle: "Capital Expenditure",
        desc: "Manajemen & pengawasan pengeluaran belanja modal (investasi & aset)",
        url: capexUrl,
        adminUrl: `${capexUrl}/admin/upload`,
        icon: Building2,
        isHosted: true,
      },
      {
        code: "opex",
        category: "overhead",
        categoryName: "Overhead",
        name: "OPEX",
        subtitle: "Operational Expenditure",
        desc: "Monitoring & pengendalian biaya operasional harian seluruh perkebunan",
        url: opexUrl,
        adminUrl: `${opexUrl}/admin`,
        icon: Receipt,
        isHosted: true,
      },
      {
        code: "poll_pg1",
        category: "overhead",
        categoryName: "Overhead",
        name: "PolPG1",
        subtitle: "Biaya Operasional Kegiatan General",
        desc: "Pengendalian biaya armada, kendaraan, dan kegiatan general perkebunan",
        url: pollPg1Url,
        adminUrl: `${pollPg1Url}/admin`,
        icon: Truck,
        isHosted: false,
      },
    ],
    [
      wipAccUrl,
      wipAccAdminUrl,
      hppUrl,
      hppPg1AdminUrl,
      hargaMaterialUrl,
      weedControlUrl,
      irigasiUrl,
      sulamUrl,
      pepayaBaseUrl,
      otherCropBaseUrl,
      bibitBaseUrl,
      capexUrl,
      opexUrl,
      pollPg1Url,
    ]
  );

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Cek apakah user memiliki akses ke suatu kode modul
  const checkUserHasAccess = useCallback(
    (moduleCode: string) => {
      if (isSuperAdmin) return true;
      if (!currentUser?.allowedDashboards) return false;
      return (
        currentUser.allowedDashboards.includes(moduleCode) ||
        currentUser.allowedDashboards.includes("ALL") ||
        currentUser.allowedDashboards.includes("all")
      );
    },
    [isSuperAdmin, currentUser]
  );

  // Hitung jumlah modul yang diizinkan per kategori untuk user saat ini
  const getCategoryAccessStats = useCallback(
    (catId: CategoryId) => {
      const catModules = allDashboardsConfig.filter((d) => d.category === catId);
      if (isSuperAdmin) {
        return {
          allowedCount: catModules.length,
          totalCount: catModules.length,
          hasAnyAccess: true,
        };
      }
      const allowed = catModules.filter((d) => checkUserHasAccess(d.code));
      return {
        allowedCount: allowed.length,
        totalCount: catModules.length,
        hasAnyAccess: allowed.length > 0,
      };
    },
    [allDashboardsConfig, isSuperAdmin, checkUserHasAccess]
  );

  // Handler SSO untuk redirect ke admin sub-dashboard
  const handleManageDashboard = async (dash: { code: string; adminUrl: string }) => {
    setSsoLoadingCode(dash.code);
    try {
      const res = await fetch("/api/auth/sso/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardCode: dash.code }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}: Gagal terhubung ke server SSO.`);
      }

      if (!res.ok || !data.success || !data.token) {
        throw new Error(data.error || `HTTP ${res.status}: Gagal membuat sesi SSO ke dashboard.`);
      }

      const targetUrl = new URL(dash.adminUrl);
      targetUrl.searchParams.set("sso", data.token);
      window.location.href = targetUrl.toString();
    } catch (err: any) {
      alert(err.message);
      setSsoLoadingCode(null);
    }
  };

  // Verifikasi sesi auth Admin Pusat
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

  // Fetch users (Khusus Super Admin)
  const fetchUsers = useCallback(async () => {
    if (currentUser?.role !== "SUPER_ADMIN") return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.role]);

  // Fetch logs
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

  const handleResetLogs = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus seluruh riwayat log aktivitas? Aksi ini tidak dapat dibatalkan."
      )
    ) {
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
        dashboardCodes:
          formData.role === "SUPER_ADMIN" ? [] : formData.dashboardCodes,
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

  // Helper render badges izin user dikelompokkan per kategori
  const renderUserDashboardBadges = (allowedDashboards: string[], userRole: string) => {
    if (
      userRole === "SUPER_ADMIN" ||
      allowedDashboards.includes("ALL") ||
      allowedDashboards.includes("all")
    ) {
      return (
        <span className="text-[11px] font-bold text-[#16823B] bg-[#EAF3EC] px-2.5 py-1 rounded-md border border-[#CBE0D1]">
          Semua Dashboard (Akses Penuh)
        </span>
      );
    }

    if (!allowedDashboards || allowedDashboards.length === 0) {
      return <span className="text-[#89938D] italic">Tidak ada akses</span>;
    }

    const grouped: { [key: string]: string[] } = {};
    for (const code of allowedDashboards) {
      const dash = allDashboardsConfig.find((d) => d.code === code);
      if (dash) {
        if (!grouped[dash.categoryName]) grouped[dash.categoryName] = [];
        grouped[dash.categoryName].push(dash.name);
      } else {
        if (!grouped["Lainnya"]) grouped["Lainnya"] = [];
        grouped["Lainnya"].push(code.toUpperCase());
      }
    }

    return (
      <div className="flex flex-col gap-1.5">
        {Object.entries(grouped).map(([catName, modules]) => (
          <div key={catName} className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-1.5 py-0.5 rounded">
              {catName}:
            </span>
            {modules.map((m) => (
              <span
                key={m}
                className="text-[10px] bg-[#EAF3EC] text-[#16823B] px-1.5 py-0.5 rounded border border-[#CBE0D1] font-bold"
              >
                {m}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Filter daftar user
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return usersList;
    const q = userSearchQuery.toLowerCase();
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [usersList, userSearchQuery]);

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return logsList.filter((log) => {
      const matchCat =
        logCategoryFilter === "all" ||
        (log.dashboardCode &&
          allDashboardsConfig.some(
            (d) => d.code === log.dashboardCode && d.category === logCategoryFilter
          ));

      const matchSearch =
        !logSearchQuery.trim() ||
        log.description.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        (log.user?.username || "").toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        (log.user?.name || "").toLowerCase().includes(logSearchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [logsList, logCategoryFilter, logSearchQuery, allDashboardsConfig]);

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

  const currentCategoryMeta = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const currentModules = selectedCategory
    ? allDashboardsConfig.filter((d) => d.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* ── HEADER BAR ── */}
      <header className="border-b border-[#DDE5DF] bg-white sticky top-0 z-50 shadow-2xs">
        <div className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <a
            href="/dashboard"
            onClick={(e) => {
              if (selectedCategory !== null) {
                e.preventDefault();
                setSelectedCategory(null);
              }
            }}
            className="flex items-center gap-3 shrink-0 py-1 group"
          >
            <div className="h-13 sm:h-14 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-13 sm:h-14 max-h-14 w-auto object-contain"
                style={{ height: "52px", maxHeight: "56px", width: "auto" }}
              />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg leading-none text-[#17231B] tracking-tight group-hover:text-[#16823B] transition-colors">
                Admin Pusat
              </h1>
              <span className="text-[10px] sm:text-xs text-[#5F6B63] font-medium hidden sm:block mt-0.5">
                Cost Control Platform Governance
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
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#F8FAF9] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#2C3830] transition-all border border-[#DDE5DF] flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Logout dari Admin Pusat"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
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
              Anda terautentikasi sebagai <strong className="text-[#17231B]">{currentUser?.role}</strong>. Seluruh identitas administrator dan alokasi hak akses dikelola secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#DDE5DF] shrink-0">
            <div className="text-right text-xs">
              <div className="text-[#5F6B63] font-medium">Akses Terdaftar</div>
              <div className="font-bold text-[#16823B]">
                {isSuperAdmin
                  ? "5 Kategori • 19 Modul (Super)"
                  : `${currentUser?.allowedDashboards.length} Modul Diizinkan`}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#DDE5DF] pb-4">
          <button
            onClick={() => setActiveTab("dashboards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "bg-white hover:bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen User</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "logs"
                ? "bg-[#16823B] text-white shadow-2xs"
                : "bg-white hover:bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Log Aktivitas</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD SAYA (2 TAHAP: PILIH KATEGORI -> KELOLA MODUL)           */}
        {/* ========================================================================= */}
        {activeTab === "dashboards" && (
          <div className="space-y-6">
            {/* TAHAP 1: PILIHAN 5 KATEGORI KOMODITAS & DIVISI */}
            {selectedCategory === null && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#17231B]">
                      Pilih Kategori Komoditas &amp; Biaya
                    </h3>
                    <p className="text-[#5F6B63] text-xs mt-0.5">
                      Pilih kategori untuk membuka dan mengelola modul dashboard yang diizinkan untuk akun Anda.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#16823B] bg-[#EAF3EC] px-3 py-1 rounded-full border border-[#CBE0D1] hidden sm:inline-block">
                    5 Kategori Komoditas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => {
                    const IconComp = cat.icon;
                    const stats = getCategoryAccessStats(cat.id);

                    return (
                      <div
                        key={cat.id}
                        className="bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#CBE0D1] transition-all group"
                      >
                        <div>
                          {/* Header Box: Icon & Badge Akses */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]">
                              <IconComp className="w-5.5 h-5.5" />
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block border ${
                                isSuperAdmin
                                  ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                                  : stats.allowedCount > 0
                                  ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {isSuperAdmin
                                ? `Akses Penuh (${stats.totalCount} Modul)`
                                : stats.allowedCount > 0
                                ? `${stats.allowedCount} dari ${stats.totalCount} Diizinkan`
                                : "Tidak Ada Akses"}
                            </span>
                          </div>

                          {/* Title & Subtitle */}
                          <div className="mb-2">
                            <h4 className="text-lg font-bold text-[#17231B] tracking-tight leading-snug">
                              {cat.name}
                            </h4>
                            <p className="text-xs font-semibold text-[#16823B] mt-0.5">
                              {cat.subtitle}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-[#5F6B63] leading-relaxed mb-6 mt-3">
                            {cat.description}
                          </p>
                        </div>

                        {/* Action Button */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:shadow-xs cursor-pointer"
                          >
                            <span>Kelola {cat.name}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAHAP 2: DAFTAR MODUL DARI KATEGORI TERPILIH */}
            {selectedCategory !== null && currentCategoryMeta && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Nav: Tombol Kembali & Switcher Kategori */}
                <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#17231B] font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
                      title="Kembali ke Pilihan Kategori"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#16823B]" />
                      <span>Kembali ke Kategori</span>
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-[#5F6B63]">
                      <span
                        onClick={() => setSelectedCategory(null)}
                        className="hover:underline cursor-pointer font-medium"
                      >
                        Kategori Utama
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#89938D]" />
                      <span className="text-[#16823B] font-bold">
                        {currentCategoryMeta.name}
                      </span>
                    </div>
                  </div>

                  {/* Quick Switcher Kategori Lain */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <span className="text-[11px] font-semibold text-[#5F6B63] mr-1 hidden lg:inline">
                      Pindah Kategori:
                    </span>
                    {categories.map((cat) => {
                      const isCurrent = cat.id === selectedCategory;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-[#16823B] text-white font-bold shadow-2xs"
                              : "bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] hover:bg-[#EEF4F0] border border-[#DDE5DF]"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Banner Kategori Terpilih */}
                <div className="bg-white border border-[#DDE5DF] border-l-4 border-l-[#16823B] rounded-2xl p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      {React.createElement(currentCategoryMeta.icon, {
                        className: "w-6 h-6",
                      })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] uppercase">
                          Modul Dashboard
                        </span>
                        <span className="text-xs font-semibold text-[#5F6B63]">
                          {currentModules.length} Modul
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#17231B] tracking-tight">
                        Kategori: {currentCategoryMeta.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5F6B63] leading-relaxed max-w-2xl mt-1">
                        {currentCategoryMeta.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right text-xs bg-[#F8FAF9] p-3 rounded-xl border border-[#DDE5DF] shrink-0">
                    <div className="text-[#5F6B63] font-medium">Izin Akun Anda</div>
                    <div className="font-bold text-[#16823B] text-sm mt-0.5">
                      {isSuperAdmin
                        ? "Semua Modul Diizinkan (Super)"
                        : `${getCategoryAccessStats(currentCategoryMeta.id).allowedCount} dari ${currentModules.length} Diizinkan`}
                    </div>
                  </div>
                </div>

                {/* Grid Modul Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentModules.map((dash) => {
                    const IconComponent = dash.icon;
                    const hasAccess = checkUserHasAccess(dash.code);
                    const isHosted = dash.isHosted;

                    return (
                      <div
                        key={dash.code}
                        className={`bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs transition-all ${
                          !isHosted
                            ? "bg-slate-50/50 border-slate-200 opacity-80"
                            : !hasAccess
                            ? "opacity-60 bg-gray-50"
                            : "hover:shadow-md hover:border-[#CBE0D1]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isHosted
                                  ? "bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]"
                                  : "bg-amber-50 border border-amber-200 text-amber-700"
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                                !isHosted
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : hasAccess
                                  ? "bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {!isHosted
                                ? "Tahap Pembuatan"
                                : hasAccess
                                ? "Akses Diizinkan"
                                : "Akses Dibatasi (403)"}
                            </span>
                          </div>

                          <h4 className="text-base sm:text-lg font-extrabold text-[#17231B] mb-0.5">
                            {dash.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#16823B] mb-2">
                            {dash.subtitle}
                          </p>
                          <p className="text-[#5F6B63] text-xs leading-relaxed mb-6">
                            {dash.desc}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#EAEFEB] flex items-center justify-between">
                          <span className="text-[11px] text-[#89938D]">
                            {!isHosted ? "Status: Belum Hosted" : "SSO: Terintegrasi"}
                          </span>
                          {!isHosted ? (
                            <div className="relative group/admin-btn">
                              <button
                                disabled
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F0F4F1] border border-[#D0DDD4] text-[#7A8A7F] font-bold text-xs cursor-not-allowed select-none"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Tahap Pembuatan</span>
                              </button>
                            </div>
                          ) : hasAccess ? (
                            <button
                              onClick={() => handleManageDashboard(dash)}
                              disabled={Boolean(ssoLoadingCode)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                              {ssoLoadingCode === dash.code ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Menghubungkan...</span>
                                </>
                              ) : (
                                <>
                                  <span>Kelola Dashboard</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANAJEMEN USER (KHUSUS SUPER ADMIN)                                */}
        {/* ========================================================================= */}
        {activeTab === "users" && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#16823B]" /> Tata Kelola Administrator &amp; Hak Akses
                </h3>
                <p className="text-[#5F6B63] text-xs mt-0.5">
                  Super Admin dapat menambah akun, mengubah role, menonaktifkan akun, dan menentukan dashboard mana yang boleh dikelola oleh Admin biasa.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Administrator Baru</span>
              </button>
            </div>

            {/* Filter Search User */}
            <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Cari administrator (nama, username, email)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#F8FAF9] border border-[#DDE5DF] text-[#17231B] placeholder:text-[#89938D] focus:outline-none focus:border-[#16823B] focus:bg-white"
                />
              </div>
              <span className="text-xs text-[#5F6B63] font-medium hidden sm:inline">
                Total: {filteredUsers.length} Pengguna
              </span>
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
                        <th className="px-6 py-4">Nama &amp; Username</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Akses Dashboard (per Kategori)</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFEB] text-[#17231B]">
                      {filteredUsers.map((u) => {
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
                              {renderUserDashboardBadges(u.allowedDashboards, u.role)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs transition-colors border border-[#DDE5DF] inline-flex items-center gap-1.5 cursor-pointer"
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

        {/* ========================================================================= */}
        {/* TAB 3: AUDIT LOG AKTIVITAS                                                */}
        {/* ========================================================================= */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#16823B]" /> Log Aktivitas Terpusat
                </h3>
                <p className="text-[#5F6B63] text-xs mt-0.5">
                  Riwayat aksi login, logout, pembuatan user, dan penukaran sesi SSO terpusat.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={handleResetLogs}
                  disabled={clearingLogs || logsList.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  title="Bersihkan seluruh riwayat aktivitas"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>{clearingLogs ? "Membersihkan..." : "Reset / Hapus Log"}</span>
                </button>
              )}
            </div>

            {/* Filter Kategori & Search Log */}
            <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setLogCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    logCategoryFilter === "all"
                      ? "bg-[#16823B] text-white shadow-2xs"
                      : "bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setLogCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      logCategoryFilter === c.id
                        ? "bg-[#16823B] text-white shadow-2xs"
                        : "bg-[#F8FAF9] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Cari aktivitas atau username..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#F8FAF9] border border-[#DDE5DF] text-[#17231B] placeholder:text-[#89938D] focus:outline-none focus:border-[#16823B] focus:bg-white"
                />
              </div>
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
                      {filteredLogs.map((log) => (
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

      {/* ── MODAL USER FORM (ADD / EDIT) DENGAN PENGELOMPOKAN KATEGORI ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#DDE5DF] rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-4">
              <h3 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#16823B]" />
                <span>{editingUser ? "Edit User & Hak Akses" : "Tambah Administrator Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F8FAF9] cursor-pointer"
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

              {/* Alokasi Hak Akses Dikelompokkan per Kategori */}
              {formData.role !== "SUPER_ADMIN" && (
                <div className="space-y-3 pt-3 border-t border-[#DDE5DF]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#2C3830] font-semibold">
                      Alokasi Akses Dashboard per Kategori
                    </label>
                    <span className="text-[10px] text-[#5F6B63] font-semibold">
                      {formData.dashboardCodes.length} modul dipilih
                    </span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto p-2 border border-[#DDE5DF] rounded-2xl bg-[#F8FAF9]">
                    {categories.map((cat) => {
                      const catModules = allDashboardsConfig.filter(
                        (d) => d.category === cat.id
                      );
                      const allSelected =
                        catModules.length > 0 &&
                        catModules.every((d) =>
                          formData.dashboardCodes.includes(d.code)
                        );

                      return (
                        <div
                          key={cat.id}
                          className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAEFEB]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                                {React.createElement(cat.icon, {
                                  className: "w-3.5 h-3.5",
                                })}
                              </div>
                              <span className="font-bold text-xs text-[#17231B]">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#5F6B63]">
                                ({catModules.length} Modul)
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const codes = catModules.map((d) => d.code);
                                if (allSelected) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    dashboardCodes: prev.dashboardCodes.filter(
                                      (c) => !codes.includes(c)
                                    ),
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    dashboardCodes: Array.from(
                                      new Set([...prev.dashboardCodes, ...codes])
                                    ),
                                  }));
                                }
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                allSelected
                                  ? "bg-[#16823B] text-white border-[#16823B]"
                                  : "bg-[#F8FAF9] text-[#16823B] border-[#CBE0D1] hover:bg-[#EAF3EC]"
                              }`}
                            >
                              {allSelected ? "Batal Semua" : "Pilih Semua"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {catModules.map((dash) => {
                              const isChecked = formData.dashboardCodes.includes(
                                dash.code
                              );
                              return (
                                <label
                                  key={dash.code}
                                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-[#EAF3EC]/60 border-[#CBE0D1] text-[#16823B] font-bold"
                                      : "bg-[#F8FAF9] border-[#EAEFEB] text-[#2C3830] hover:bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleDashboardCode(dash.code)}
                                      className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-0 shrink-0 cursor-pointer"
                                    />
                                    <span className="truncate">{dash.name}</span>
                                  </div>
                                  {!dash.isHosted && (
                                    <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200/80 px-1 py-0.5 rounded font-medium shrink-0">
                                      Tahap Pembuatan
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#DDE5DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAF9] hover:bg-gray-100 text-[#2C3830] font-semibold border border-[#DDE5DF] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
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
