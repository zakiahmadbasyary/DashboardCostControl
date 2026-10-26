"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, Eye, LogOut, LayoutDashboard, Menu, X, Shield } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = `${adminBaseUrl}/dashboard`;
    }
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
              <h2 className="font-extrabold text-base text-[#17231B]">GGF Admin</h2>
              <p className="text-xs font-medium text-[#5F6B63]">OPEX Panel</p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F7F9F7]"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <p className="px-3 text-xs font-extrabold text-[#89938D] uppercase tracking-wider mb-2.5">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
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
      <div className="p-4 border-t border-[#DDE5DF] space-y-2.5">
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
          <span>Lihat Dashboard Publik</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-white border-b border-[#DDE5DF] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GGF Logo" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="font-extrabold text-sm text-[#17231B]">GGF Admin</h2>
            <p className="text-[10px] text-[#5F6B63]">OPEX Panel</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-[#5F6B63] hover:text-[#17231B] rounded-lg hover:bg-[#F7F9F7]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop Drawer Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl transition-transform duration-300 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-72 bg-white border-r border-[#DDE5DF] h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
