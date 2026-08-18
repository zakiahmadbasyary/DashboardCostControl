"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/upload");
  }, [router]);

  return (
    <div className="py-12 text-center text-xs text-[#5F6B63]">
      Mengalihkan ke halaman Upload Data...
    </div>
  );
}
