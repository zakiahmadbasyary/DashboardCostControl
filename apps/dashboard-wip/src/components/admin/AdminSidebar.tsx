"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UploadCloud, Eye, LogOut, LayoutDashboard, Menu, X, Shield } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";

  const handleLogout = async () => {
    window.location.href = `${adminBaseUrl}/login`;
  };

  const navItems = [
    { label: "Upload Data Excel", href: "/admin/upload", icon: UploadCloud },
    { label: "Preview Data", href: "/admin/preview", icon: Eye },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-[#DDE5DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-11 max-h-11 w-auto object-contain"
                style={{ height: "44px", maxHeight: "44px", width: "auto" }}
              />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#17231B]">GGF Admin</h2>
              <p className="text-[11px] text-[#5F6B63]">WIP ACC Panel</p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F7F9F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-2">Data Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#16823B] text-white shadow-xs"
                    : "text-[#5F6B63] hover:bg-[#F7F9F7] hover:text-[#17231B]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-[#DDE5DF] space-y-2">
        <a
          href={`${adminBaseUrl}/dashboard`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] transition-colors"
        >
          <Shield className="w-4 h-4 text-[#16823B]" />
          <span>Ke Admin Pusat</span>
        </a>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#5F6B63] hover:bg-[#F7F9F7] transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-[#16823B]" />
          <span>Lihat Dashboard Publik</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-white border-b border-[#DDE5DF] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs w-full">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-auto flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="GGF Logo"
              className="h-11 max-h-11 w-auto object-contain"
              style={{ height: "44px", maxHeight: "44px", width: "auto" }}
            />
          </div>
          <span className="font-extrabold text-sm text-[#17231B]">GGF Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#17231B] bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Overlay & Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Container */}
          <div className="relative w-72 bg-white h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#DDE5DF] flex-col justify-between h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
