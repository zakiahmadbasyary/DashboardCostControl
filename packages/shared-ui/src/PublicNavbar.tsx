"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "./config";
import { LayoutGrid, Menu, X } from "lucide-react";

export interface PublicNavbarProps {
  currentDashboard: "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c";
  brandTitle?: string;
  brandSubtitle?: string;
  logoElement?: React.ReactNode;
  showPortalLink?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentDashboard,
  brandTitle = "GGF AgroMetric",
  brandSubtitle = "Enterprise Dashboard Platform",
  logoElement,
  showPortalLink = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, portalUrl } = getDashboardNavConfig();

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-[#DDE5DF] shadow-sm isolate">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5 shrink-0 bg-white py-1">
            {logoElement ? (
              logoElement
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#16823B] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                GP
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#17231B] tracking-tight leading-none">
                  {brandTitle}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#5F6B63] hidden xs:block mt-0.5">
                {brandSubtitle}
              </p>
            </div>
          </div>

          {/* Direct Main Navigation Items (Inline in Header) */}
          <nav className="hidden lg:flex items-center gap-2 h-full">
            {navItems.map((item) => {
              const isActive = currentDashboard === item.key;
              return (
                <a
                  key={item.key}
                  href={item.url}
                  className={`h-full flex items-center px-4 text-xs sm:text-sm font-semibold transition-all relative border-b-2 ${
                    isActive
                      ? "border-[#16823B] text-[#16823B] bg-[#F4F9F5]"
                      : "border-transparent text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                  title={item.description}
                >
                  {item.label}
                  {isActive && (
                    <span className="ml-2 text-[10px] bg-[#EAF3EC] text-[#16823B] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action: Portal Link */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {showPortalLink && (
              <a
                href={portalUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-all shadow-xs"
                title="Buka Portal Utama"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#2C3830] hover:bg-[#F4F7F5] transition-colors border border-[#DDE5DF]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Solid Background, High Z-Index) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DDE5DF] bg-white px-4 py-3 space-y-2 shadow-lg relative z-[101]">
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
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1]"
                      : "text-[#4A554E] hover:bg-[#F8FAF9]"
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

          {showPortalLink && (
            <div className="pt-2 border-t border-[#E3EBE5]">
              <a
                href={portalUrl}
                className="w-full text-center py-2.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#5F6B63]" />
                <span>Portal Utama</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
