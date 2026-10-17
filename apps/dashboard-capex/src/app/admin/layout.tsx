"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col lg:flex-row text-[#17231B] font-sans">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 overflow-y-auto max-w-full w-full">
        {children}
      </main>
    </div>
  );
}
