"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F7F9F7] flex flex-col lg:flex-row text-[#17231B] font-sans selection:bg-[#16823B] selection:text-white">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto h-full">
        {children}
      </main>
    </div>
  );
}
