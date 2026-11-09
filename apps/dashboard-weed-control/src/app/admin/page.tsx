"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/upload");
  }, [router]);

  return (
    <div className="py-16 text-center text-xs text-[#5F6B63] flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin" />
      <span>Mengalihkan ke halaman Upload Data Weed Control...</span>
    </div>
  );
}

