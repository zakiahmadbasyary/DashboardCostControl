"use client";

import React, { useState } from "react";
import { getDashboardNavConfig } from "./config";
import { Leaf, LayoutGrid, Menu, X, ShieldCheck } from "lucide-react";

export interface PublicNavbarProps {
  currentDashboard?: "wip" | "dashboard_a" | "dashboard_b" | "dashboard_c" | "portal" | string;
  brandTitle?: string;
  brandSubtitle?: string;
  logoElement?: React.ReactNode;
  showPortalLink?: boolean;
  showAdminLink?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentDashboard = "portal",
  brandTitle = "AgroMetric",
  brandSubtitle,
  logoElement,
  showPortalLink = true,
  showAdminLink = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, portalUrl, adminUrl } = getDashboardNavConfig();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E9E6] shadow-xs w-full relative opacity-100">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 bg-white opacity-100">
        <div className="h-16 flex items-center justify-between gap-6">
          
          {/* Left Brand & Navigation Items */}
          <div className="flex items-center gap-6">
            {/* Brand Logo & Title */}
            <a href={portalUrl} className="flex items-center gap-2.5 shrink-0 py-1 group">
              {logoElement ? (
                logoElement
              ) : (
                <div className="w-8 h-8 rounded-lg border border-[#CBE0D1] bg-[#EAF5ED] text-[#16823B] flex items-center justify-center font-bold shadow-2xs">
                  <Leaf className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-extrabold text-lg text-[#172B4D] tracking-tight leading-none group-hover:text-[#16823B] transition-colors">
                  {brandTitle}
                </span>
                {brandSubtitle && (
                  <p className="text-[10px] text-[#5F6B63] hidden xs:block mt-0.5">
                    {brandSubtitle}
                  </p>
                )}
              </div>
            </a>

            {/* Direct Main Navigation Items */}
            <nav className="hidden lg:flex items-center gap-5 h-full ml-2">
              {navItems.map((item) => {
                const isActive = currentDashboard === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.url}
                    className={`text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-[#16823B] font-bold"
                        : "text-[#5E6C84] hover:text-[#172B4D]"
                    }`}
                    title={item.description}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right Action: Separator & Admin Pusat Link */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
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
              <>
                <div className="h-4 w-[1px] bg-[#E0E0E0]" />
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16823B] hover:text-[#126B30] transition-colors"
                  title="Buka Control Panel Admin Pusat"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Pusat</span>
                </a>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#2C3830] hover:bg-[#F4F7F5] transition-colors border border-[#DDE5DF]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
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
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E3EBE5] flex flex-col gap-2">
            {showPortalLink && currentDashboard !== "portal" && (
              <a
                href={portalUrl}
                className="w-full text-center py-2.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-[#2C3830] font-semibold text-xs flex items-center justify-center gap-1.5"
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
                className="w-full text-center py-2.5 rounded-xl bg-[#EAF5ED] text-[#16823B] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#CBE0D1]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Pusat</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
