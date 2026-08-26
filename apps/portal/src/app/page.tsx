import { PublicNavbar } from "@dashboard/shared-ui";
import {
  LineChart,
  BarChart3,
  Banknote,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function PortalHomePage() {
  const publicDashboards = [
    {
      id: "wip-acc",
      name: "WIP ACC",
      description:
        "Monitoring Work in Process (WIP) costs specifically for ACC regions. Track daily operational expenditures and efficiency metrics.",
      url: process.env.NEXT_PUBLIC_WIP_URL || "http://localhost:3000",
      icon: LineChart,
    },
    {
      id: "wip-pg1",
      name: "WIP PG1",
      description:
        "Detailed analysis of Work in Process costs for PG1 operations. Includes variance analysis and budget tracking tools.",
      url: process.env.NEXT_PUBLIC_DASHBOARD_A_URL || "http://localhost:3002",
      icon: BarChart3,
    },
    {
      id: "hpp-pg1",
      name: "HPP PG1",
      description:
        "Harga Pokok Produksi (Cost of Goods Sold) tracking for PG1. Evaluate final production costs against historical benchmarks.",
      url: process.env.NEXT_PUBLIC_DASHBOARD_B_URL || "http://localhost:3003",
      icon: Banknote,
    },
    {
      id: "hpp-m3",
      name: "HPP M3",
      description:
        "Cost of Production analysis for M3 facilities. Focuses on material yields and labor cost distribution across sectors.",
      url: process.env.NEXT_PUBLIC_DASHBOARD_C_URL || "http://localhost:3004",
      icon: Landmark,
    },
  ];

  const adminCard = {
    id: "admin-pusat",
    name: "Admin Pusat",
    description:
      "Central administration hub. Manage user permissions, system master data, data uploads, and view global activity logs.",
    url: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
    icon: ShieldCheck,
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172B4D] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white">
      {/* Shared Public Header / Navbar */}
      <PublicNavbar
        currentDashboard="portal"
        brandTitle="AgroMetric"
        showPortalLink={false}
        showAdminLink={true}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Page Title & Subtitle Section */}
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172B4D] tracking-tight">
            Cost Control Dashboard
          </h1>
          <p className="text-[#5E6C84] text-sm sm:text-base max-w-3xl leading-relaxed">
            Centralized portal for monitoring, analyzing, and optimizing agricultural production costs across all operational regions. Access your specific modules below.
          </p>
        </div>

        {/* Public Dashboards Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {publicDashboards.map((dash) => {
            const IconComponent = dash.icon;
            return (
              <div
                key={dash.id}
                className="bg-white border border-[#E5E9E6] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group"
              >
                {/* Decorative Top Right Circle */}
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#EAF5ED]/60 pointer-events-none group-hover:scale-110 transition-transform" />

                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Icon Box */}
                  <div className="w-10 h-10 rounded-xl bg-[#EAF5ED] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center mb-4 shrink-0 shadow-2xs">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-bold text-[#172B4D] mb-2 tracking-tight">
                    {dash.name}
                  </h2>
                  <p className="text-xs text-[#5E6C84] leading-relaxed mb-6 flex-1">
                    {dash.description}
                  </p>
                </div>

                {/* Bottom Button */}
                <div className="relative z-10 pt-2">
                  <a
                    href={dash.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group-hover:shadow-md"
                  >
                    <span>Buka Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Pusat Card (Left-aligned, 1 Column Wide with Left Green Accent Border) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E5E9E6] border-l-4 border-l-[#16823B] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group">
            {/* Decorative Top Right Circle */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#EAF5ED]/60 pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="relative z-10 flex-1 flex flex-col">
              {/* Icon Box */}
              <div className="w-10 h-10 rounded-xl bg-[#EAF5ED] border border-[#CBE0D1] text-[#16823B] flex items-center justify-center mb-4 shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-[#172B4D] mb-2 tracking-tight">
                {adminCard.name}
              </h2>
              <p className="text-xs text-[#5E6C84] leading-relaxed mb-6 flex-1">
                {adminCard.description}
              </p>
            </div>

            {/* Bottom Outline Button */}
            <div className="relative z-10 pt-2">
              <a
                href={adminCard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#16823B] hover:bg-[#F4F9F5] text-[#16823B] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Kelola Sistem</span>
                <Settings className="w-3.5 h-3.5 text-[#16823B]" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E9E6] bg-white py-6 text-center text-xs text-[#5E6C84]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AgroMetric Platform. Enterprise Cost Control Portal.</p>
          <div className="flex gap-6 font-medium text-[#172B4D]">
            <a href={process.env.NEXT_PUBLIC_WIP_URL || "http://localhost:3000"} className="hover:text-[#16823B]">WIP ACC</a>
            <a href={process.env.NEXT_PUBLIC_DASHBOARD_A_URL || "http://localhost:3002"} className="hover:text-[#16823B]">WIP PG1</a>
            <a href={process.env.NEXT_PUBLIC_DASHBOARD_B_URL || "http://localhost:3003"} className="hover:text-[#16823B]">HPP PG1</a>
            <a href={process.env.NEXT_PUBLIC_DASHBOARD_C_URL || "http://localhost:3004"} className="hover:text-[#16823B]">HPP M3</a>
            <a href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"} className="hover:text-[#16823B]">Admin Pusat</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
