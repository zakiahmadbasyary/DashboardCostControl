"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // Check mock authentication status
    if (!authService.isAuthenticated()) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#5F6B63]">Memeriksa sesi admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex text-[#17231B] font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
