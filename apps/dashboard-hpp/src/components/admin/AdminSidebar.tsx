"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, Eye, LayoutDashboard, Menu, X, Shield, ArrowLeft } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Upload Data Excel", href: "/admin/upload", icon: UploadCloud },
    { label: "Preview Data Database", href: "/admin/preview", icon: Eye },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-[#DDE5DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#16823B] text-white shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#17231B]">GGF Admin Panel</h2>
              <p className="text-[11px] text-[#5F6B63]">Dashboard HPP PG1</p>
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
          <p className="px-3 text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-2">Manajemen Data HPP</p>
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
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-[#16823B] bg-[#EAF3EC] hover:bg-[#16823B] hover:text-white transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard HPP</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-white border-b border-[#DDE5DF] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#16823B] text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-[#17231B]">GGF HPP Admin</span>
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
