"use client";

import Image from "next/image";
import logoImg from "@/assets/logo.png";
import { PublicNavbar } from "@dashboard/shared-ui";

export default function DashboardHeader() {
  const customLogo = (
    <div className="h-9 sm:h-10 w-auto flex items-center shrink-0">
      <Image
        src={logoImg}
        alt="GGF Logo"
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );

  return (
    <PublicNavbar
      currentDashboard="wip"
      brandTitle="Dashboard WIP ACC"
      brandSubtitle="Cost Control Dashboard & Data Analysis"
      logoElement={customLogo}
      showPortalLink={true}
    />
  );
}
