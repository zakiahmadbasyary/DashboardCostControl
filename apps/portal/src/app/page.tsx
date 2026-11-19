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
  ArrowLeft,
  Settings,
  Clock,
  Globe,
  Menu,
  X,
  Citrus,
  Leaf,
  Layers,
  ChevronRight,
} from "lucide-react";

type CategoryId = "nanas" | "pepaya" | "othercrop" | "bibit" | "overhead";

interface CategoryMeta {
  id: CategoryId;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  totalModules: number;
  activeModules: number;
}

interface DashboardModule {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  url: string;
  icon: React.ElementType;
  badge: string;
  isHosted: boolean;
}

export default function PortalHomePage() {
  // null = Tahap 1 (Portal 1: Pilih Kategori)
  // CategoryId = Tahap 2 (Portal 2: Tampilkan Modul Kategori Terpilih)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    portalUrl,
    mainEstatePortalUrl,
    wipAccUrl,
    hppUrl,
    capexUrl,
    opexUrl,
    irigasiUrl,
    sulamUrl,
    weedControlUrl,
    hargaMaterialUrl,
    pollPg1Url,
    adminUrl,
  } = getDashboardNavConfig();

  const pepayaBaseUrl = process.env.NEXT_PUBLIC_PEPAYA_URL || "http://localhost:3011";
  const otherCropBaseUrl = process.env.NEXT_PUBLIC_OTHER_CROP_URL || "http://localhost:3012";
  const bibitBaseUrl = process.env.NEXT_PUBLIC_BIBIT_URL || "http://localhost:3013";

  // Data 5 Kategori (Portal 1)
  const categories: CategoryMeta[] = [
    {
      id: "nanas",
      name: "Nanas",
      subtitle: "Perkebunan Nanas PG 1",
      description:
        "Monitoring Work in Process (WIP), HPP produksi akhir, master harga material, weed control, irigasi, dan evaluasi penyulaman perkebunan nanas.",
      icon: Sprout,
      badge: "6 Modul (5 Aktif)",
      totalModules: 6,
      activeModules: 5,
    },
    {
      id: "pepaya",
      name: "Pepaya",
      subtitle: "Perkebunan Pepaya PG 1",
      description:
        "Pengawasan biaya operasional pemeliharaan (WIP), kalkulasi HPP panen, dan evaluasi penyulaman tanaman pada kebun pepaya.",
      icon: Citrus,
      badge: "3 Modul (Tahap Pembuatan)",
      totalModules: 3,
      activeModules: 0,
    },
    {
      id: "othercrop",
      name: "OtherCrop",
      subtitle: "Aneka Tanaman & Hortikultura",
      description:
        "Pelacakan biaya operasional WIP kebun, analisis HPP produksi, serta evaluasi aktivitas penyulaman untuk komoditas hortikultura dan tanaman lainnya.",
      icon: Leaf,
      badge: "3 Modul (Tahap Pembuatan)",
      totalModules: 3,
      activeModules: 0,
    },
    {
      id: "bibit",
      name: "Bibit",
      subtitle: "Divisi Nursery & Storing Bibit",
      description:
        "Pengendalian biaya WIP dan HPP bibit anakan (sucker) serta pengawasan biaya penyimpanan dan pemeliharaan fasilitas storing bibit.",
      icon: Layers,
      badge: "4 Modul (Tahap Pembuatan)",
      totalModules: 4,
      activeModules: 0,
    },
    {
      id: "overhead",
      name: "Overhead",
      subtitle: "Biaya Umum & Fasilitas",
      description:
        "Pengelolaan belanja modal (CAPEX), pengendalian biaya operasional harian (OPEX), dan biaya operasional pool kendaraan & armada general (POL PG1).",
      icon: Building2,
      badge: "3 Modul (2 Aktif)",
      totalModules: 3,
      activeModules: 2,
    },
  ];

  // Data 19 Modul (Portal 2 per Kategori)
  const categoryModules: Record<CategoryId, DashboardModule[]> = {
    nanas: [
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
          "Pelacakan dan analisis Harga Pokok Produksi (HPP) akhir serta evaluasi efisiensi biaya produksi nanas.",
        url: hppUrl,
        icon: Banknote,
        badge: "Produksi",
        isHosted: true,
      },
      {
        id: "harga-material",
        name: "Harga Material",
        subtitle: "Master Data Logistik",
        description:
          "Pusat tracking harga master material, bahan baku, pupuk, serta fluktuasi logistik perkebunan.",
        url: hargaMaterialUrl,
        icon: Boxes,
        badge: "Master Logistik",
        isHosted: true,
      },
      {
        id: "weed-control",
        name: "Evaluasi Weed Control",
        subtitle: "Pengendalian Gulma",
        description:
          "Monitoring dan pengendalian biaya penyiangan gulma, aplikasi herbisida, serta efisiensi weed control perkebunan.",
        url: weedControlUrl,
        icon: Tractor,
        badge: "Pemeliharaan",
        isHosted: true,
      },
      {
        id: "irigasi",
        name: "Evaluasi Irigasi",
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
        name: "Evaluasi Sulam",
        subtitle: "Pemeliharaan Tanaman",
        description:
          "Monitoring biaya material pupuk/bibit dan efisiensi aktivitas penyulaman tanaman perkebunan nanas.",
        url: sulamUrl,
        icon: Sprout,
        badge: "Pemeliharaan",
        isHosted: true,
      },
    ],
    pepaya: [
      {
        id: "pepaya-wip",
        name: "WIP",
        subtitle: "Work In Process Pepaya",
        description:
          "Monitoring biaya perawatan dan aktivitas Work In Process untuk kebun pepaya PG1.",
        url: `${pepayaBaseUrl}/wip`,
        icon: LineChart,
        badge: "Cost Control",
        isHosted: false,
      },
      {
        id: "pepaya-hpp",
        name: "HPP",
        subtitle: "Harga Pokok Produksi Pepaya",
        description:
          "Analisis Harga Pokok Produksi akhir dan evaluasi efisiensi biaya panen perkebunan pepaya.",
        url: `${pepayaBaseUrl}/hpp`,
        icon: Banknote,
        badge: "Produksi",
        isHosted: false,
      },
      {
        id: "pepaya-sulam",
        name: "Evaluasi Sulam",
        subtitle: "Penyulaman Kebun Pepaya",
        description:
          "Evaluasi efektivitas penggunaan bibit sulam dan biaya aktivitas penyulaman kebun pepaya.",
        url: `${pepayaBaseUrl}/sulam`,
        icon: Sprout,
        badge: "Pemeliharaan",
        isHosted: false,
      },
    ],
    othercrop: [
      {
        id: "othercrop-wip",
        name: "WIP",
        subtitle: "Work In Process OtherCrop",
        description:
          "Monitoring biaya operasional dan pemeliharaan untuk komoditas hortikultura serta tanaman lainnya.",
        url: `${otherCropBaseUrl}/wip`,
        icon: LineChart,
        badge: "Cost Control",
        isHosted: false,
      },
      {
        id: "othercrop-hpp",
        name: "HPP",
        subtitle: "Harga Pokok Produksi OtherCrop",
        description:
          "Kalkulasi HPP dan analisis efisiensi biaya panen untuk aneka komoditas perkebunan.",
        url: `${otherCropBaseUrl}/hpp`,
        icon: Banknote,
        badge: "Produksi",
        isHosted: false,
      },
      {
        id: "othercrop-sulam",
        name: "Evaluasi Sulam",
        subtitle: "Penyulaman OtherCrop",
        description:
          "Monitoring penggunaan bibit sulam dan biaya tenaga kerja penyulaman aneka tanaman.",
        url: `${otherCropBaseUrl}/sulam`,
        icon: Sprout,
        badge: "Pemeliharaan",
        isHosted: false,
      },
    ],
    bibit: [
      {
        id: "bibit-wip-sucker",
        name: "WIP Sucker",
        subtitle: "Work In Process Sucker",
        description:
          "Pengendalian biaya penyediaan, persiapan, dan perawatan bibit anakan (sucker).",
        url: `${bibitBaseUrl}/wip-sucker`,
        icon: LineChart,
        badge: "Pembibitan",
        isHosted: false,
      },
      {
        id: "bibit-hpp-sucker",
        name: "HPP Sucker",
        subtitle: "Harga Pokok Produksi Sucker",
        description:
          "Perhitungan harga pokok per batang bibit sucker siap tanam ke areal perkebunan.",
        url: `${bibitBaseUrl}/hpp-sucker`,
        icon: Banknote,
        badge: "Biaya Bibit",
        isHosted: false,
      },
      {
        id: "bibit-wip-storing",
        name: "WIP Storing",
        subtitle: "Work In Process Storing",
        description:
          "Monitoring biaya penyimpanan, karantina, dan pemeliharaan bibit selama masa storing.",
        url: `${bibitBaseUrl}/wip-storing`,
        icon: Boxes,
        badge: "Penyimpanan",
        isHosted: false,
      },
      {
        id: "bibit-hpp-storing",
        name: "HPP Storing",
        subtitle: "Harga Pokok Storing Bibit",
        description:
          "Analisis total biaya penyimpanan dan penanganan bibit sebelum didistribusikan.",
        url: `${bibitBaseUrl}/hpp-storing`,
        icon: Banknote,
        badge: "Biaya Bibit",
        isHosted: false,
      },
    ],
    overhead: [
      {
        id: "capex",
        name: "CAPEX",
        subtitle: "Capital Expenditure",
        description:
          "Pengelolaan dan pengawasan pengeluaran belanja modal (Capital Expenditure) investasi & aset perusahaan.",
        url: capexUrl,
        icon: Building2,
        badge: "Belanja Modal",
        isHosted: true,
      },
      {
        id: "opex",
        name: "OPEX",
        subtitle: "Operational Expenditure",
        description:
          "Monitoring dan pengendalian biaya operasional harian (Operational Expenditure) perkebunan PG 1.",
        url: opexUrl,
        icon: Receipt,
        badge: "Biaya Operasional",
        isHosted: true,
      },
      {
        id: "poll-pg1",
        name: "PolPG1",
        subtitle: "Biaya Operasional Kegiatan General",
        description:
          "Pengendalian biaya operasional yang dilakukan untuk keperluan armada, transportasi, dan kegiatan general.",
        url: pollPg1Url,
        icon: Truck,
        badge: "Operasional General",
        isHosted: false,
      },
    ],
  };

  const currentCategoryMeta = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const currentModules = selectedCategory
    ? categoryModules[selectedCategory]
    : [];

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToPortal1 = () => {
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full">
        <div className="w-full max-w-[95%] mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Left Brand Logo & Title */}
            <a
              href={portalUrl}
              onClick={(e) => {
                if (selectedCategory !== null) {
                  e.preventDefault();
                  handleBackToPortal1();
                }
              }}
              className="flex items-center gap-2 sm:gap-3.5 min-w-0 py-1 group focus:outline-none"
            >
              <div className="h-10 sm:h-14 w-auto flex items-center shrink-0">
                <img
                  src="/logo.png"
                  alt="GGF Logo"
                  className="h-10 sm:h-14 max-h-14 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-extrabold text-xs sm:text-base lg:text-lg text-[#17231B] group-hover:text-[#16823B] tracking-tight leading-snug transition-colors truncate">
                  Cost Control Dashboard Portal
                </span>
                <span className="text-xs sm:text-sm text-[#5F6B63] hidden sm:block font-medium leading-tight mt-0.5">
                  Sistem Informasi Manajemen Estate PG 1
                </span>
              </div>
            </a>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <a
                href={mainEstatePortalUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs sm:text-sm transition-all shadow-xs"
                title="Kembali ke Portal Utama Estate PG 1 (Seluruh Sistem)"
              >
                <Globe className="w-4 h-4 text-[#16823B]" />
                <span>Portal Utama Estate</span>
              </a>

              <a
                href={adminUrl}
                className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                title="Buka Admin Pusat"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="sm:hidden flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                suppressHydrationWarning
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#17231B] transition-all shadow-2xs cursor-pointer active:scale-95"
                aria-label={mobileMenuOpen ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#16823B]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#16823B]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#DDE5DF] bg-white px-4 py-3.5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <span className="text-[11px] font-extrabold text-[#5F6B63] uppercase tracking-wider px-1">
              Navigasi Cepat
            </span>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={mainEstatePortalUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#EAF3EC] text-[#16823B] flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <span>Portal Utama Estate</span>
              </a>
              <a
                href={adminUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600/40 text-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Admin Pusat</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* ========================================================================= */}
        {/* TAHAP 1: PORTAL 1 (PILIH 5 KATEGORI KOMODITAS & DIVISI)                    */}
        {/* ========================================================================= */}
        {selectedCategory === null && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Title & Subtitle Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
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

            {/* Section Heading */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17231B] tracking-tight">
                    Pilih Kategori Komoditas &amp; Biaya
                  </h2>
                  <p className="text-xs text-[#5F6B63] mt-0.5 font-medium">
                    Pilih salah satu kategori komoditas atau divisi untuk melihat dashboard yang tersedia.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#16823B] bg-[#EAF3EC] px-3 py-1 rounded-full border border-[#CBE0D1] hidden sm:inline-block">
                  5 Kategori Komoditas
                </span>
              </div>

              {/* Grid 5 Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#CBE0D1] transition-all group"
                    >
                      <div>
                        {/* Header Box: Icon & Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]">
                            <IconComp className="w-5.5 h-5.5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block text-[#17231B] bg-[#FCE27A]/90">
                            {cat.badge}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="mb-2">
                          <h3 className="text-lg font-bold text-[#17231B] tracking-tight leading-snug">
                            {cat.name}
                          </h3>
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
                          onClick={() => handleSelectCategory(cat.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:shadow-xs cursor-pointer"
                        >
                          <span>Lihat Dashboard {cat.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: DAFTAR MODUL DARI KATEGORI TERPILIH                              */}
        {/* ========================================================================= */}
        {selectedCategory !== null && currentCategoryMeta && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Bar: Navigasi Kembali & Quick Switcher Kategori */}
            <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToPortal1}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#17231B] font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
                  title="Kembali ke Pilihan Kategori"
                >
                  <ArrowLeft className="w-4 h-4 text-[#16823B]" />
                  <span>Kembali ke Kategori</span>
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-[#5F6B63]">
                  <span
                    onClick={handleBackToPortal1}
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
                      onClick={() => handleSelectCategory(cat.id)}
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
                      {currentModules.length} Modul Tersedia
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B] tracking-tight">
                    Kategori: {currentCategoryMeta.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5F6B63] leading-relaxed max-w-2xl mt-1">
                    {currentCategoryMeta.description}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right text-xs bg-[#F8FAF9] p-3 rounded-xl border border-[#DDE5DF] shrink-0">
                <div className="text-[#5F6B63] font-medium">Status Modul</div>
                <div className="font-bold text-[#16823B] text-sm mt-0.5">
                  {currentCategoryMeta.activeModules > 0
                    ? `${currentCategoryMeta.activeModules} dari ${currentCategoryMeta.totalModules} Aktif`
                    : "Tahap Pembuatan"}
                </div>
              </div>
            </div>

            {/* Grid Modul Portal 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentModules.map((dash) => {
                const IconComponent = dash.icon;
                return (
                  <div
                    key={dash.id}
                    className={`bg-white border border-[#DDE5DF] rounded-2xl p-6 flex flex-col justify-between shadow-2xs transition-all ${
                      !dash.isHosted
                        ? "bg-slate-50/50"
                        : "hover:shadow-md hover:border-[#CBE0D1] group"
                    }`}
                  >
                    <div>
                      {/* Icon & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                            dash.isHosted
                              ? "bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]"
                              : "bg-amber-50 border border-amber-200/80 text-amber-700"
                          }`}
                        >
                          <IconComponent className="w-5.5 h-5.5" />
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block ${
                            dash.isHosted
                              ? "text-[#17231B] bg-[#FCE27A]/90"
                              : "text-amber-800 bg-amber-100/90 border border-amber-200"
                          }`}
                        >
                          {dash.isHosted ? dash.badge : "Tahap Pembuatan"}
                        </span>
                      </div>

                      {/* Name & Subtitle */}
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-[#17231B] tracking-tight leading-snug">
                          {dash.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#16823B] mt-0.5">
                          {dash.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#5F6B63] leading-relaxed mb-6 mt-3">
                        {dash.description}
                      </p>
                    </div>

                    {/* Action Button */}
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
          </div>
        )}

        {/* ── BANNER ADMIN PUSAT (SELALU TAMPIL DI BAWAH) ── */}
        <div className="mt-10 bg-white border border-[#DDE5DF] border-l-4 border-l-[#16823B] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
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

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63]">
        <div className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Great Giant Foods. Enterprise Cost Control Portal.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 font-medium text-[#17231B]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className="hover:text-[#16823B] cursor-pointer"
              >
                {cat.name}
              </button>
            ))}
            <a href={adminUrl} className="hover:text-[#16823B]">
              Admin Pusat
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
