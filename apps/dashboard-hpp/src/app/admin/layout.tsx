"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col lg:flex-row text-[#17231B] font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[95%] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
