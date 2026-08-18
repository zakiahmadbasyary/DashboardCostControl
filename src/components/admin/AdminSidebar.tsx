"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Leaf, UploadCloud, Eye, History, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  
  const navItems = [
    { label: "Upload Data", href: "/admin/upload", icon: UploadCloud },
    { label: "Preview Data", href: "/admin/preview", icon: Eye },
    { label: "Log Aktivitas", href: "/admin/logs", icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#DDE5DF] flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-[#DDE5DF] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16823B] text-[#A8D437] flex items-center justify-center font-bold shadow-xs">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-[#17231B]">GGF Admin</h2>
            <p className="text-[11px] text-[#5F6B63]">WIP ACC Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-2">Data Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
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
    </aside>
  );
}
