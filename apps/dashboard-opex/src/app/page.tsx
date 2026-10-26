"use client";

import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardOpexPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* Header & Sidebar Navigation */}
      <DashboardHeader />

      {/* Main Container (Kosong) */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-5 sm:py-6" />
    </div>
  );
}

