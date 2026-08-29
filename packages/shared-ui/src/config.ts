export interface DashboardNavItem {
  key: "portal" | "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c";
  label: string;
  url: string;
  description: string;
}

export interface DashboardNavConfig {
  navItems: DashboardNavItem[];
  portalUrl: string;
  adminUrl: string;
  wipAccUrl: string;
  wipPg1Url: string;
  hppPg1Url: string;
  hppM3Url: string;
  wipAccAdminUrl: string;
  wipPg1AdminUrl: string;
  hppPg1AdminUrl: string;
  hppM3AdminUrl: string;
}

export const getDashboardNavConfig = (): DashboardNavConfig => {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";
  const wipAccUrl =
    process.env.NEXT_PUBLIC_WIP_ACC_URL ||
    process.env.NEXT_PUBLIC_WIP_URL ||
    "http://localhost:3001";
  const wipPg1Url =
    process.env.NEXT_PUBLIC_WIP_PG1_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_A_URL ||
    "http://localhost:3002";
  const hppPg1Url =
    process.env.NEXT_PUBLIC_HPP_PG1_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_B_URL ||
    "http://localhost:3003";
  const hppM3Url =
    process.env.NEXT_PUBLIC_HPP_M3_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_C_URL ||
    "http://localhost:3004";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";

  const wipAccAdminUrl =
    process.env.NEXT_PUBLIC_WIP_ACC_ADMIN_URL || `${wipAccUrl}/admin`;
  const wipPg1AdminUrl =
    process.env.NEXT_PUBLIC_WIP_PG1_ADMIN_URL || `${wipPg1Url}/admin`;
  const hppPg1AdminUrl =
    process.env.NEXT_PUBLIC_HPP_PG1_ADMIN_URL || `${hppPg1Url}/admin`;
  const hppM3AdminUrl =
    process.env.NEXT_PUBLIC_HPP_M3_ADMIN_URL || `${hppM3Url}/admin`;

  return {
    navItems: [
      {
        key: "wip",
        label: "WIP ACC",
        url: wipAccUrl,
        description: "Monitoring Cost Control WIP ACC",
      },
      {
        key: "dashboard_a",
        label: "WIP PG1",
        url: wipPg1Url,
        description: "Operasional & Performa Produksi PG1",
      },
      {
        key: "dashboard_b",
        label: "HPP PG1",
        url: hppPg1Url,
        description: "Harga Pokok Produksi & Inventaris PG1",
      },
      {
        key: "dashboard_c",
        label: "HPP M3",
        url: hppM3Url,
        description: "Audit Finansial & Laporan Eksekutif M3",
      },
    ],
    portalUrl,
    adminUrl,
    wipAccUrl,
    wipPg1Url,
    hppPg1Url,
    hppM3Url,
    wipAccAdminUrl,
    wipPg1AdminUrl,
    hppPg1AdminUrl,
    hppM3AdminUrl,
  };
};
