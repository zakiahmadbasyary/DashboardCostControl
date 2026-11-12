"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, Eye, LayoutDashboard, Menu, X, Shield, Tractor } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";

  const navItems = [
    { label: "Upload Data Excel", href: "/admin/upload", icon: UploadCloud },
    { label: "Preview Data", href: "/admin/preview", icon: Eye },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-[#DDE5DF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-10 max-h-10 w-auto object-contain"
                style={{ height: "40px", maxHeight: "40px", width: "auto" }}
              />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#17231B] leading-tight flex items-center gap-1.5">
                <span>GGF Admin</span>
              </h2>
              <p className="text-xs font-semibold text-[#16823B] flex items-center gap-1 mt-0.5">
                <Tractor className="w-3.5 h-3.5" />
                <span>Weed Control Panel</span>
              </p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F7F9F7] cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-xs font-extrabold text-[#89938D] uppercase tracking-wider mb-2">
            Data Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#16823B] text-white shadow-xs"
                    : "text-[#5F6B63] hover:bg-[#F7F9F7] hover:text-[#17231B]"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-[#DDE5DF] space-y-2 shrink-0">
        <a
          href={`${adminBaseUrl}/dashboard`}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] transition-colors shadow-2xs"
        >
          <Shield className="w-4.5 h-4.5 text-[#16823B] shrink-0" />
          <span>Ke Admin Pusat</span>
        </a>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5F6B63] hover:bg-[#F7F9F7] hover:text-[#17231B] transition-colors"
        >
          <LayoutDashboard className="w-4.5 h-4.5 text-[#16823B] shrink-0" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <div className="pt-1.5 text-center text-[11px] text-[#89938D]">
          © 2026 Great Giant Foods
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-[#DDE5DF] px-4 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GGF Logo" className="h-8 w-auto object-contain" />
          <div>
            <span className="font-extrabold text-sm text-[#17231B]">GGF Admin</span>
            <span className="text-[11px] text-[#16823B] font-semibold block -mt-0.5">Weed Control</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-[#5F6B63] hover:text-[#17231B] rounded-xl hover:bg-[#F7F9F7] border border-[#DDE5DF] cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5 text-[#16823B]" />
        </button>
      </div>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-72 bg-white border-r border-[#DDE5DF] h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#0c1a10]/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
