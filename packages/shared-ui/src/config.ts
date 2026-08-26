export interface DashboardNavItem {
  key: "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c";
  label: string;
  url: string;
  description: string;
}

export interface DashboardNavConfig {
  navItems: DashboardNavItem[];
  portalUrl: string;
  adminUrl: string;
}

export const getDashboardNavConfig = (): DashboardNavConfig => {
  const wipUrl = process.env.NEXT_PUBLIC_WIP_URL || "http://localhost:3000";
  const dashboardAUrl = process.env.NEXT_PUBLIC_DASHBOARD_A_URL || "http://localhost:3002";
  const dashboardBUrl = process.env.NEXT_PUBLIC_DASHBOARD_B_URL || "http://localhost:3003";
  const dashboardCUrl = process.env.NEXT_PUBLIC_DASHBOARD_C_URL || "http://localhost:3004";
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3005";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

  return {
    navItems: [
      {
        key: "wip",
        label: "Dashboard WIP",
        url: wipUrl,
        description: "Cost Control & Work In Progress",
      },
      {
        key: "dashboard_a",
        label: "Dashboard A",
        url: dashboardAUrl,
        description: "Operasional & Performa Produksi",
      },
      {
        key: "dashboard_b",
        label: "Dashboard B",
        url: dashboardBUrl,
        description: "Manajemen Inventaris & Logistik",
      },
      {
        key: "dashboard_c",
        label: "Dashboard C",
        url: dashboardCUrl,
        description: "Audit Finansial & Laporan Eksekutif",
      },
    ],
    portalUrl,
    adminUrl,
  };
};
