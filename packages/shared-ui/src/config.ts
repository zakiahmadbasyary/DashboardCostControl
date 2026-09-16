export interface DashboardNavItem {
  key: string;
  label: string;
  url: string;
  description: string;
  isHosted?: boolean;
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
  const hppUrl =
    process.env.NEXT_PUBLIC_HPP_URL ||
    process.env.NEXT_PUBLIC_HPP_PG1_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_A_URL ||
    "http://localhost:3002";
  const capexUrl =
    process.env.NEXT_PUBLIC_CAPEX_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_B_URL ||
    "http://localhost:3003";
  const opexUrl =
    process.env.NEXT_PUBLIC_OPEX_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_C_URL ||
    "http://localhost:3004";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";
  const irigasiUrl = process.env.NEXT_PUBLIC_IRIGASI_URL || "http://localhost:3006";
  const sulamUrl = process.env.NEXT_PUBLIC_SULAM_URL || "http://localhost:3007";
  const selesaiBongkarUrl = process.env.NEXT_PUBLIC_SELESAI_BONGKAR_URL || "http://localhost:3008";
  const hargaMaterialUrl = process.env.NEXT_PUBLIC_HARGA_MATERIAL_URL || "http://localhost:3009";
  const pollPg1Url = process.env.NEXT_PUBLIC_POLL_PG1_URL || "http://localhost:3010";

  const wipPg1Url =
    process.env.NEXT_PUBLIC_WIP_PG1_URL || hppUrl;
  const hppPg1Url =
    process.env.NEXT_PUBLIC_HPP_PG1_URL || hppUrl;
  const hppM3Url =
    process.env.NEXT_PUBLIC_HPP_M3_URL || opexUrl;

  const wipAccAdminUrl =
    process.env.NEXT_PUBLIC_WIP_ACC_ADMIN_URL || `${wipAccUrl}/admin`;
  const wipPg1AdminUrl =
    process.env.NEXT_PUBLIC_WIP_PG1_ADMIN_URL || `${hppUrl}/admin`;
  const hppPg1AdminUrl =
    process.env.NEXT_PUBLIC_HPP_PG1_ADMIN_URL || `${hppUrl}/admin`;
  const hppM3AdminUrl =
    process.env.NEXT_PUBLIC_HPP_M3_ADMIN_URL || `${opexUrl}/admin`;

  return {
    navItems: [
      {
        key: "wip",
        label: "WIP",
        url: wipAccUrl,
        description: "Monitoring Cost Control WIP ACC",
        isHosted: true,
      },
      {
        key: "hpp",
        label: "HPP",
        url: hppUrl,
        description: "Harga Pokok Produksi (HPP)",
        isHosted: true,
      },
      {
        key: "capex",
        label: "Capex",
        url: capexUrl,
        description: "Capital Expenditure (Belanja Modal)",
        isHosted: true,
      },
      {
        key: "opex",
        label: "Opex",
        url: opexUrl,
        description: "Operational Expenditure (Biaya Operasional)",
        isHosted: true,
      },
      {
        key: "irigasi",
        label: "Irigasi",
        url: irigasiUrl,
        description: "Pengawasan Biaya & Operasional Irigasi (Tahap Pembuatan)",
        isHosted: false,
      },
      {
        key: "sulam",
        label: "Sulam",
        url: sulamUrl,
        description: "Monitoring Biaya Pemeliharaan & Penyulaman (Tahap Pembuatan)",
        isHosted: false,
      },
      {
        key: "selesai_bongkar",
        label: "Selesai Bongkar",
        url: selesaiBongkarUrl,
        description: "Evaluasi Pasca Selesai Bongkar (Tahap Pembuatan)",
        isHosted: false,
      },
      {
        key: "harga_material",
        label: "Harga Material",
        url: hargaMaterialUrl,
        description: "Master Data & Fluktuasi Harga Material (Tahap Pembuatan)",
        isHosted: false,
      },
      {
        key: "poll_pg1",
        label: "Poll PG 1",
        url: pollPg1Url,
        description: "Pengendalian Biaya Armada & Transportasi PG1 (Tahap Pembuatan)",
        isHosted: false,
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
