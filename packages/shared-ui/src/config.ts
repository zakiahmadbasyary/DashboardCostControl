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
        label: "WIP ACC",
        url: wipUrl,
        description: "Dashboard WIP ACC (Cost Control)",
      },
      {
        key: "dashboard_a",
        label: "WIP PG1",
        url: dashboardAUrl,
        description: "Dashboard WIP PG1 (Operasional)",
      },
      {
        key: "dashboard_b",
        label: "HPP PG1",
        url: dashboardBUrl,
        description: "Dashboard HPP PG1 (Inventaris & Logistik)",
      },
      {
        key: "dashboard_c",
        label: "HPP M3",
        url: dashboardCUrl,
        description: "Dashboard HPP M3 (Audit & Finansial)",
      },
    ],
    portalUrl,
    adminUrl,
  };
};
