"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "./config";
import { LogIn, LayoutGrid, Menu, X, ShieldCheck } from "lucide-react";

export interface PublicNavbarProps {
  currentDashboard: "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c";
  brandTitle?: string;
  brandSubtitle?: string;
  logoElement?: React.ReactNode;
  showAdminLink?: boolean;
  showPortalLink?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentDashboard,
  brandTitle = "GGF AgroMetric",
  brandSubtitle = "Enterprise Dashboard Platform",
  logoElement,
  showAdminLink = true,
  showPortalLink = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, portalUrl, adminUrl } = getDashboardNavConfig();

  return (
    <header className="bg-white border-b border-[#DDE5DF] sticky top-0 z-40 shadow-xs">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            {logoElement ? (
              logoElement
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                GP
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#17231B] tracking-tight">
                  {brandTitle}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#5F6B63] hidden xs:block">
                {brandSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F7F5] p-1 rounded-xl border border-[#E3EBE5]">
            {navItems.map((item) => {
              const isActive = currentDashboard === item.key;
              return (
                <a
                  key={item.key}
                  href={item.url}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#16823B] font-bold shadow-xs border border-[#D5E3D8]"
                      : "text-[#4A554E] hover:text-[#17231B] hover:bg-white/60"
                  }`}
                  title={item.description}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16823B]"></span>
                  )}
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions: Portal & Admin */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {showPortalLink && (
              <a
                href={portalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all cursor-pointer"
                title="Buka Portal Utama"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
            )}

            {showAdminLink && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Pusat</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {showAdminLink && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-[#16823B] text-white text-xs font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px]">Admin</span>
              </a>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#2C3830] hover:bg-[#F4F7F5] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDE5DF] bg-[#F8FAF9] px-4 py-3 space-y-2">
          <div className="text-[11px] font-semibold text-[#5F6B63] uppercase tracking-wider mb-1 px-1">
            Pilih Dashboard Publik
          </div>
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = currentDashboard === item.key;
              return (
                <a
                  key={item.key}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-white text-[#16823B] font-bold border border-[#D5E3D8] shadow-xs"
                      : "text-[#4A554E] hover:bg-white/80"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-[10px] bg-[#EAF3EC] text-[#16823B] px-2 py-0.5 rounded-full font-semibold">
                      Aktif
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E3EBE5] flex items-center justify-between gap-2">
            {showPortalLink && (
              <a
                href={portalUrl}
                className="flex-1 text-center py-2 rounded-lg border border-[#DDE5DF] bg-white text-[#2C3830] font-semibold text-xs"
              >
                Portal Utama
              </a>
            )}
            {showAdminLink && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 rounded-lg bg-[#16823B] text-white font-semibold text-xs"
              >
                Admin Pusat
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
