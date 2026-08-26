"use client";

import React, { useState } from "react";
import logoImg from "./assets/logo.png";
import { getDashboardNavConfig } from "./config";
import { LayoutGrid, Menu, X, ShieldCheck } from "lucide-react";

export interface PublicNavbarProps {
  currentDashboard?: "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c" | "portal" | string;
  brandTitle?: string;
  brandSubtitle?: string;
  logoElement?: React.ReactNode;
  showPortalLink?: boolean;
  showAdminLink?: boolean;
  className?: string;
  containerClassName?: string;
  logoClassName?: string;
  navClassName?: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentDashboard = "portal",
  brandTitle = "GGF AgroMetric",
  brandSubtitle = "Enterprise Cost Control Platform",
  logoElement,
  showPortalLink = true,
  showAdminLink = true,
  className = "",
  containerClassName = "",
  logoClassName = "",
  navClassName = "",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, portalUrl, adminUrl } = getDashboardNavConfig();

  const logoSrc = typeof logoImg === "string" ? logoImg : (logoImg as unknown as { src: string })?.src;

  const defaultLogo = (
    <div className={`h-9 max-h-9 w-auto flex items-center shrink-0 overflow-hidden ${logoClassName}`} style={{ height: "36px", maxHeight: "36px" }}>
      <img
        src={logoSrc}
        alt="GGF Logo"
        className="h-9 max-h-9 w-auto object-contain"
        style={{ height: "36px", maxHeight: "36px", width: "auto" }}
      />
    </div>
  );

  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-[#DDE5DF] shadow-2xs w-full ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        <div className="h-16 sm:h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title (Clickable Link to Portal) */}
          <a
            href={portalUrl}
            className="flex items-center gap-3 shrink-0 bg-white py-1 group focus:outline-none"
            title="Ke Beranda Portal"
          >
            <div className="h-9 max-h-9 w-auto flex items-center shrink-0 overflow-hidden" style={{ height: "36px", maxHeight: "36px" }}>
              {logoElement || defaultLogo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[#17231B] group-hover:text-[#16823B] tracking-tight leading-none transition-colors">
                  {brandTitle}
                </span>
                {brandSubtitle && (
                  <p className="text-[10px] text-[#5F6B63] hidden xs:block mt-0.5 font-medium">
                    {brandSubtitle}
                  </p>
                )}
              </div>
            </div>
          </a>

          {/* Center Main Navigation Items (Horizontal Row on Tablet & Desktop >= md) */}
          <nav className={`hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap ${navClassName}`}>
            {navItems.map((item) => {
              const isActive = currentDashboard === item.key;
              return (
                <a
                  key={item.key}
                  href={item.url}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1]"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                  title={item.description}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16823B]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action: Portal Link & Admin Pusat Link (Horizontal on Tablet & Desktop >= md) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {showPortalLink && currentDashboard !== "portal" && (
              <a
                href={portalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all shadow-xs"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs transition-all shadow-xs"
                title="Buka Admin Pusat"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Button (Garis Tiga: ONLY on small screens < md) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#2C3830] hover:bg-[#F4F7F5] transition-colors border border-[#DDE5DF]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#16823B]" /> : <Menu className="w-5 h-5 text-[#5F6B63]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDE5DF] bg-white px-4 py-3 space-y-2 shadow-lg relative z-[101]">
          <div className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider mb-1 px-1">
            Navigasi Dashboard
          </div>
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = currentDashboard === item.key;
              return (
                <a
                  key={item.key}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1]"
                      : "text-[#2C3830] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-[10px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-bold">
                      Aktif
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E3EBE5] flex flex-col gap-2">
            {showPortalLink && currentDashboard !== "portal" && (
              <a
                href={portalUrl}
                className="w-full text-center py-2 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
            )}

            {showAdminLink && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Admin Pusat</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
