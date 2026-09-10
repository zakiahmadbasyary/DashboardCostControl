export interface DashboardNavItem {
  key: string;
  label: string;
  url: string;
  description: string;
}

export interface DashboardNavConfig {
  navItems: DashboardNavItem[];
  portalUrl: string;
  adminUrl: string;
  wipAccUrl: string;
  hppUrl: string;
  capexUrl: string;
  opexUrl: string;
  irigasiUrl: string;
  sulamUrl: string;
  selesaiBongkarUrl: string;
  hargaMaterialUrl: string;
  pollPg1Url: string;
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

  const hppUrl = process.env.NEXT_PUBLIC_HPP_URL || hppPg1Url;
  const capexUrl = process.env.NEXT_PUBLIC_CAPEX_URL || "#";
  const opexUrl = process.env.NEXT_PUBLIC_OPEX_URL || "#";
  const irigasiUrl = process.env.NEXT_PUBLIC_IRIGASI_URL || "#";
  const sulamUrl = process.env.NEXT_PUBLIC_SULAM_URL || "#";
  const selesaiBongkarUrl = process.env.NEXT_PUBLIC_SELESAI_BONGKAR_URL || "#";
  const hargaMaterialUrl = process.env.NEXT_PUBLIC_HARGA_MATERIAL_URL || "#";
  const pollPg1Url = process.env.NEXT_PUBLIC_POLL_PG1_URL || wipPg1Url;

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
        label: "WIP",
        url: wipAccUrl,
        description: "Monitoring Cost Control WIP ACC",
      },
      {
        key: "hpp",
        label: "HPP",
        url: hppUrl,
        description: "Harga Pokok Produksi (HPP)",
      },
      {
        key: "capex",
        label: "Capex",
        url: capexUrl,
        description: "Capital Expenditure (Belanja Modal)",
      },
      {
        key: "opex",
        label: "Opex",
        url: opexUrl,
        description: "Operational Expenditure (Biaya Operasional)",
      },
      {
        key: "irigasi",
        label: "Irigasi",
        url: irigasiUrl,
        description: "Pengawasan Biaya & Operasional Irigasi",
      },
      {
        key: "sulam",
        label: "Sulam",
        url: sulamUrl,
        description: "Monitoring Biaya Pemeliharaan & Penyulaman",
      },
      {
        key: "selesai_bongkar",
        label: "Selesai Bongkar",
        url: selesaiBongkarUrl,
        description: "Evaluasi Pasca Selesai Bongkar",
      },
      {
        key: "harga_material",
        label: "Harga Material",
        url: hargaMaterialUrl,
        description: "Master Data & Fluktuasi Harga Material",
      },
      {
        key: "poll_pg1",
        label: "Poll PG 1",
        url: pollPg1Url,
        description: "Pengendalian Biaya Armada & Transportasi PG1",
      },
    ],
    portalUrl,
    adminUrl,
    wipAccUrl,
    hppUrl,
    capexUrl,
    opexUrl,
    irigasiUrl,
    sulamUrl,
    selesaiBongkarUrl,
    hargaMaterialUrl,
    pollPg1Url,
    wipPg1Url,
    hppPg1Url,
    hppM3Url,
    wipAccAdminUrl,
    wipPg1AdminUrl,
    hppPg1AdminUrl,
    hppM3AdminUrl,
  };
};
