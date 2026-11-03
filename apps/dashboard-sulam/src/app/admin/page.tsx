"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/upload");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64 text-xs font-semibold text-[#5F6B63]">
      Mengarahkan ke Halaman Upload Data Excel...
    </div>
  );
}
