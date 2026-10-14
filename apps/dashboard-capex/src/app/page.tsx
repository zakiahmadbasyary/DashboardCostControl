"use client";

import React, { useState } from "react";
import CapexDashboardHeader from "@/components/CapexDashboardHeader";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Layers,
  Activity,
  Target,
  ShoppingCart,
  Stamp,
  Lock,
} from "lucide-react";

// ─── DUMMY DATA (mencerminkan skema Total + status_capex 5 nilai) ─────────────

/** Dummy data sesuai struktur tabel `total` di skema CAPEX */
const TOTAL_DATA = [
  {
    id_total: 1,
    capex_no: "CAP-2025-001",
    description: "Pembangunan Gudang Penyimpanan TBS – Blok A3",
    budget_type: "INVESTASI",
    budget_status: "approved",
    req_date: "2025-01-10",
    quantity: 1,
    amount: 3500000000,
    cost_center: "CC-PG1-INF",
    io: "IO-2025-001",
    mo: null,
    wbs: null,
    nomor_pr: "PR-20250110",
    status_capex: "Sudah PO",
    tahun: 2025,
    komoditi: "Bangunan",
  },
  {
    id_total: 2,
    capex_no: "CAP-2025-002",
    description: "Pengadaan Excavator Komatsu PC200-8",
    budget_type: "INVESTASI",
    budget_status: "approved",
    req_date: "2025-01-15",
    quantity: 1,
    amount: 2800000000,
    cost_center: "CC-MEKA",
    io: "IO-2025-002",
    mo: null,
    wbs: null,
    nomor_pr: "PR-20250115",
    status_capex: "Sudah Close",
    tahun: 2025,
    komoditi: "Alat Berat",
    is_manually_closed: true,
    closed_by: "Admin CAPEX",
  },
  {
    id_total: 3,
    capex_no: "CAP-2025-003",
    description: "Pemasangan Sistem Irigasi Sprinkler Otomatis Blok D1–D4",
    budget_type: "INVESTASI",
    budget_status: "approved",
    req_date: "2025-02-01",
    quantity: 1,
    amount: 1950000000,
    cost_center: "CC-IRG",
    io: null,
    mo: null,
    wbs: "WBS-2025-003",
    nomor_pr: null,
    status_capex: "Final Approve",
    tahun: 2025,
    komoditi: "Irigasi",
  },
  {
    id_total: 4,
    capex_no: "CAP-2025-004",
    description: "Upgrade Server & Jaringan Fiber Optic Kantor Pusat",
    budget_type: "INVESTASI",
    budget_status: "in process",
    req_date: "2025-02-15",
    quantity: 1,
    amount: 1200000000,
    cost_center: "CC-IT",
    io: null,
    mo: null,
    wbs: "WBS-2025-004",
    nomor_pr: null,
    status_capex: "Sudah Created",
    tahun: 2025,
    komoditi: "Teknologi Informasi",
  },
  {
    id_total: 5,
    capex_no: null,
    description: "Pengadaan Drone Survey Lahan Perkebunan",
    budget_type: "INVESTASI",
    budget_status: null,
    req_date: null,
    quantity: 3,
    amount: 480000000,
    cost_center: "CC-SURVEY",
    io: null,
    mo: null,
    wbs: null,
    nomor_pr: null,
    status_capex: "Belum Created",
    tahun: 2025,
    komoditi: "Peralatan Survey",
  },
  {
    id_total: 6,
    capex_no: "CAP-2025-005",
    description: "Pembangunan Rumah Karyawan Afdeling F – 20 Unit",
    budget_type: "INVESTASI",
    budget_status: "in process",
    req_date: "2025-03-01",
    quantity: 20,
    amount: 4200000000,
    cost_center: "CC-HRD",
    io: null,
    mo: "MO-2025-005",
    wbs: null,
    nomor_pr: null,
    status_capex: "Sudah Created",
    tahun: 2025,
    komoditi: "Bangunan",
  },
  {
    id_total: 7,
    capex_no: "CAP-2025-006",
    description: "Pengadaan Mesin Pengemasan Pupuk – Unit Pupuk",
    budget_type: "INVESTASI",
    budget_status: "approved",
    req_date: "2025-03-10",
    quantity: 2,
    amount: 920000000,
    cost_center: "CC-PUPUK",
    io: "IO-2025-006",
    mo: null,
    wbs: null,
    nomor_pr: "PR-20250310",
    status_capex: "Sudah PO",
    tahun: 2025,
    komoditi: "Mesin & Peralatan",
  },
  {
    id_total: 8,
    capex_no: null,
    description: "Pengadaan Truk Angkut TBS 10-Ton – 3 Unit",
    budget_type: "PENGGANTIAN",
    budget_status: null,
    req_date: null,
    quantity: 3,
    amount: 1650000000,
    cost_center: "CC-ARMADA",
    io: null,
    mo: null,
    wbs: null,
    nomor_pr: null,
    status_capex: "Belum Created",
    tahun: 2025,
    komoditi: "Kendaraan",
  },
];

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Belum Created":  { label: "Belum Created",  color: "text-[#89938D]",  bg: "bg-[#F4F7F5]",  border: "border-[#DDE5DF]", icon: AlertCircle },
  "Sudah Created":  { label: "Sudah Created",  color: "text-[#f9a91b]",  bg: "bg-[#FEF6E5]",  border: "border-[#FCDFA8]", icon: Clock },
  "Final Approve":  { label: "Final Approve",  color: "text-[#29a9d6]",  bg: "bg-[#E5F6FC]",  border: "border-[#B8E4F4]", icon: Stamp },
  "Sudah PO":       { label: "Sudah PO",       color: "text-[#7c3aed]",  bg: "bg-[#F3EEFF]",  border: "border-[#D8C8FB]", icon: ShoppingCart },
  "Sudah Close":    { label: "Sudah Close",    color: "text-[#16823B]",  bg: "bg-[#EAF3EC]",  border: "border-[#CBE0D1]", icon: Lock },
};

const STATUS_ORDER = ["Belum Created", "Sudah Created", "Final Approve", "Sudah PO", "Sudah Close"];

const BUDGET_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "in process": { label: "In Process", color: "text-[#f9a91b]",  bg: "bg-[#FEF6E5]" },
  "approved":   { label: "Approved",   color: "text-[#16823B]",  bg: "bg-[#EAF3EC]" },
};

const TAHUN_OPTIONS = ["2025", "2024", "2023"];
const STATUS_OPTIONS = ["Semua Status", ...STATUS_ORDER];
const KOMODITI_OPTIONS = ["Semua Komoditi", ...Array.from(new Set(TOTAL_DATA.map((d) => d.komoditi || "—")))];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatRp(val: number | null | undefined) {
  if (val == null) return "—";
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${val.toLocaleString("id-ID")}`;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[10px] text-[#89938D] font-medium">—</span>;
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-[10px] text-[#89938D]">{status}</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function BudgetStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[10px] text-[#89938D]">—</span>;
  const cfg = BUDGET_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-[10px]">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function DashboardCapexPage() {
  const [tahun, setTahun] = useState("2025");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [komoditiFilter, setKomoditiFilter] = useState("Semua Komoditi");

  // Filter data
  const filtered = TOTAL_DATA.filter((d) => {
    const matchTahun = !d.tahun || String(d.tahun) === tahun;
    const matchStatus = statusFilter === "Semua Status" || d.status_capex === statusFilter;
    const matchKomoditi = komoditiFilter === "Semua Komoditi" || d.komoditi === komoditiFilter;
    return matchTahun && matchStatus && matchKomoditi;
  });

  // Summary metrics
  const totalAnggaran = TOTAL_DATA.reduce((s, d) => s + (d.amount ?? 0), 0);
  const countByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = TOTAL_DATA.filter((d) => d.status_capex === s).length;
    return acc;
  }, {} as Record<string, number>);

  const sudahPO = countByStatus["Sudah PO"] + countByStatus["Sudah Close"];
  const inProcess = countByStatus["Sudah Created"] + countByStatus["Final Approve"];

  const SUMMARY_CARDS = [
    {
      label: "Total Anggaran CAPEX",
      value: formatRp(totalAnggaran),
      sub: `${TOTAL_DATA.length} item terdaftar`,
      icon: DollarSign,
      color: "text-[#16823B]",
      bg: "bg-[#EAF3EC]",
      border: "border-[#CBE0D1]",
      trend: null,
    },
    {
      label: "Sudah PO / Close",
      value: String(sudahPO),
      sub: "item terealisasi",
      icon: CheckCircle2,
      color: "text-[#7c3aed]",
      bg: "bg-[#F3EEFF]",
      border: "border-[#D8C8FB]",
      trend: { up: true, pct: `${Math.round((sudahPO / TOTAL_DATA.length) * 100)}% dari total` },
    },
    {
      label: "Sedang Berjalan",
      value: String(inProcess),
      sub: "Created & Final Approve",
      icon: Activity,
      color: "text-[#29a9d6]",
      bg: "bg-[#E5F6FC]",
      border: "border-[#B8E4F4]",
      trend: null,
    },
    {
      label: "Belum Created",
      value: String(countByStatus["Belum Created"]),
      sub: "belum ada data Created",
      icon: Target,
      color: "text-[#f9a91b]",
      bg: "bg-[#FEF6E5]",
      border: "border-[#FCDFA8]",
      trend: countByStatus["Belum Created"] > 0 ? { up: false, pct: "Perlu tindak lanjut" } : null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <CapexDashboardHeader />

      <main className="w-full max-w-[95%] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── PAGE TITLE + FILTERS ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-[#16823B]" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#17231B] tracking-tight">
                Dashboard CAPEX
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5F6B63] font-medium">
              Capital Expenditure · Rekonsiliasi Budget & Created · Tahun {tahun}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Tahun */}
            <div className="relative">
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#DDE5DF] bg-white text-[#17231B] font-semibold text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-[#16823B]/20 cursor-pointer"
              >
                {TAHUN_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5F6B63] pointer-events-none" />
            </div>

            {/* Komoditi */}
            <div className="relative">
              <select
                value={komoditiFilter}
                onChange={(e) => setKomoditiFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#DDE5DF] bg-white text-[#17231B] font-semibold text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-[#16823B]/20 cursor-pointer"
              >
                {KOMODITI_OPTIONS.map((k) => <option key={k}>{k}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5F6B63] pointer-events-none" />
            </div>

            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F0F7F2] text-[#2C3830] font-semibold text-xs shadow-xs transition-all">
              <RefreshCw className="w-3 h-3 text-[#16823B]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs shadow-xs transition-all">
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SUMMARY_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className={`bg-white rounded-2xl border ${c.border} p-4 sm:p-5 flex flex-col gap-2 shadow-xs hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-[11px] sm:text-xs font-semibold text-[#5F6B63] leading-tight">{c.label}</p>
                  <div className={`${c.bg} p-1.5 rounded-lg shrink-0`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-[#17231B] leading-tight">{c.value}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-[#89938D] font-medium">{c.sub}</span>
                  {c.trend && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${c.trend.up ? "text-[#16823B]" : "text-[#f9a91b]"}`}>
                      {c.trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {c.trend.pct}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── STATUS PIPELINE + BREAKDOWN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Status Pipeline */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-[#16823B]" />
              <h2 className="text-sm font-bold text-[#17231B]">Pipeline Status CAPEX</h2>
            </div>
            <div className="space-y-2">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                const count = countByStatus[s] ?? 0;
                const pctVal = TOTAL_DATA.length ? Math.round((count / TOTAL_DATA.length) * 100) : 0;
                return (
                  <div key={s} className={`${cfg.bg} border ${cfg.border} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
                      <span className={`text-xs font-semibold ${cfg.color}`}>{s}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden hidden sm:block">
                        <div className={`h-full rounded-full ${cfg.bg.replace("bg-", "bg-").replace("[", "[")}`}
                          style={{ width: `${pctVal}%`, backgroundColor: "currentColor" }} />
                      </div>
                      <span className={`text-base font-extrabold ${cfg.color} w-5 text-right`}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#E8EFE9] text-center">
              <span className="text-[11px] text-[#89938D] font-medium">Total: </span>
              <span className="text-[11px] font-bold text-[#17231B]">{TOTAL_DATA.length} item CAPEX</span>
            </div>
          </div>

          {/* Budget Status Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DDE5DF] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-[#16823B]" />
              <h2 className="text-sm font-bold text-[#17231B]">Distribusi Anggaran per Komoditi</h2>
            </div>
            <div className="space-y-3">
              {KOMODITI_OPTIONS.filter((k) => k !== "Semua Komoditi").map((k) => {
                const items = TOTAL_DATA.filter((d) => d.komoditi === k);
                const total = items.reduce((s, d) => s + (d.amount ?? 0), 0);
                const pctVal = totalAnggaran ? Math.round((total / totalAnggaran) * 100) : 0;
                return (
                  <div key={k} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[#2C3830]">{k}</span>
                        <span className="ml-2 text-[10px] text-[#89938D]">{items.length} item</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#17231B]">{formatRp(total)}</span>
                        <span className="text-[10px] text-[#89938D] ml-1">{pctVal}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#E8EFE9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#16823B] to-[#a8d437] transition-all duration-500"
                        style={{ width: `${pctVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TABEL TOTAL CAPEX ── */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-[#E8EFE9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16823B]" />
              <h2 className="text-sm font-bold text-[#17231B]">Data CAPEX — Tabel Total</h2>
              <span className="text-[10px] bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] px-2 py-0.5 rounded-full font-bold">
                {filtered.length} item
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-[#5F6B63]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-2.5 pr-7 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] text-[#17231B] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#16823B]/20 cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[820px]">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E8EFE9]">
                  {[
                    ["Capex No", "left"],
                    ["Deskripsi", "left"],
                    ["Cost Center", "left"],
                    ["Komoditi", "left"],
                    ["Nomor PR", "left"],
                    ["Anggaran", "right"],
                    ["Budget Status", "center"],
                    ["Status CAPEX", "center"],
                  ].map(([label, align]) => (
                    <th
                      key={label}
                      className={`px-3 py-2.5 text-${align} font-bold text-[#5F6B63] uppercase tracking-wide text-[10px]`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5F1]">
                {filtered.map((row, i) => (
                  <tr key={row.id_total} className={`hover:bg-[#F8FAF9] transition-colors ${i % 2 === 0 ? "" : "bg-[#FAFCFB]"}`}>
                    <td className="px-3 py-3 font-mono text-[10px] font-bold text-[#5F6B63] whitespace-nowrap">
                      {row.capex_no ?? <span className="text-[#B0B9B3] italic">—</span>}
                    </td>
                    <td className="px-3 py-3 max-w-[260px]">
                      <div className="font-semibold text-[#17231B] leading-tight line-clamp-2">{row.description}</div>
                      <div className="text-[10px] text-[#89938D] mt-0.5">{row.budget_type}</div>
                    </td>
                    <td className="px-3 py-3 text-[#5F6B63] font-mono text-[10px]">{row.cost_center}</td>
                    <td className="px-3 py-3 text-[#5F6B63]">{row.komoditi ?? "—"}</td>
                    <td className="px-3 py-3 font-mono text-[10px]">
                      {row.nomor_pr
                        ? <span className="text-[#7c3aed] font-bold">{row.nomor_pr}</span>
                        : <span className="text-[#B0B9B3] italic">belum ada PO</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-[#17231B] whitespace-nowrap">
                      {formatRp(row.amount)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <BudgetStatusBadge status={row.budget_status} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={row.status_capex} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#89938D] font-medium text-sm">
                      <XCircle className="w-8 h-8 text-[#DDE5DF] mx-auto mb-2" />
                      Tidak ada data yang sesuai filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-[#E8EFE9] bg-[#F8FAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-[#5F6B63] font-medium">
              Menampilkan <span className="font-bold text-[#17231B]">{filtered.length}</span> dari{" "}
              <span className="font-bold text-[#17231B]">{TOTAL_DATA.length}</span> item · Tahun {tahun}
            </span>
            <span className="text-[10px] text-[#89938D]">
              Data dummy — akan dihubungkan ke database · GGF AgroMetric
            </span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-[#DDE5DF] bg-white py-4 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-[#89938D] font-medium">
            © 2026 GGF AgroMetric · Dashboard CAPEX — Capital Expenditure
          </span>
          <span className="text-[11px] text-[#89938D]">
            Schema: v1.0 · PostgreSQL schema <code className="font-mono text-[#5F6B63]">capex</code> · {TOTAL_DATA.length} item terdaftar
          </span>
        </div>
      </footer>
    </div>
  );
}
