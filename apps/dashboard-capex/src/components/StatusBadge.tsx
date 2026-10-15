import React from "react";

interface StatusBadgeProps {
  status: string | null | undefined;
  size?: "sm" | "md";
}

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  // 1. Belum Created (Paling Hijau Muda / Sangat Muda)
  "Belum Created": {
    label: "Belum Created",
    color: "text-[#16A34A]",
    bg: "bg-[#F0FDF4]",
    border: "border-[#BBF7D0]",
  },
  "Belum_Created": {
    label: "Belum Created",
    color: "text-[#16A34A]",
    bg: "bg-[#F0FDF4]",
    border: "border-[#BBF7D0]",
  },
  belum_created: {
    label: "Belum Created",
    color: "text-[#16A34A]",
    bg: "bg-[#F0FDF4]",
    border: "border-[#BBF7D0]",
  },

  // 2. Sudah Created (Hijau Muda Sedang)
  "Sudah Created": {
    label: "Sudah Created",
    color: "text-[#15803D]",
    bg: "bg-[#DCFCE7]",
    border: "border-[#86EFAC]",
  },
  "Sudah_Created": {
    label: "Sudah Created",
    color: "text-[#15803D]",
    bg: "bg-[#DCFCE7]",
    border: "border-[#86EFAC]",
  },
  sudah_created: {
    label: "Sudah Created",
    color: "text-[#15803D]",
    bg: "bg-[#DCFCE7]",
    border: "border-[#86EFAC]",
  },

  // 3. Final Approve (Hijau Medium)
  "Final Approve": {
    label: "Final Approve",
    color: "text-[#0D6D32]",
    bg: "bg-[#C6F1D5]",
    border: "border-[#5DC283]",
  },
  "Final_Approve": {
    label: "Final Approve",
    color: "text-[#0D6D32]",
    bg: "bg-[#C6F1D5]",
    border: "border-[#5DC283]",
  },
  final_approve: {
    label: "Final Approve",
    color: "text-[#0D6D32]",
    bg: "bg-[#C6F1D5]",
    border: "border-[#5DC283]",
  },

  // 4. Sudah PO (Hijau Tua Sedang)
  "Sudah PO": {
    label: "Sudah PO",
    color: "text-[#075322]",
    bg: "bg-[#A7E2B9]",
    border: "border-[#3CA464]",
  },
  "Sudah_PO": {
    label: "Sudah PO",
    color: "text-[#075322]",
    bg: "bg-[#A7E2B9]",
    border: "border-[#3CA464]",
  },
  sudah_po: {
    label: "Sudah PO",
    color: "text-[#075322]",
    bg: "bg-[#A7E2B9]",
    border: "border-[#3CA464]",
  },

  // 5. Sudah Close (Paling Hijau Tua)
  "Sudah Close": {
    label: "Sudah Close",
    color: "text-white",
    bg: "bg-[#0D5224]",
    border: "border-[#093C1A]",
  },
  "Sudah_Close": {
    label: "Sudah Close",
    color: "text-white",
    bg: "bg-[#0D5224]",
    border: "border-[#093C1A]",
  },
  sudah_close: {
    label: "Sudah Close",
    color: "text-white",
    bg: "bg-[#0D5224]",
    border: "border-[#093C1A]",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#89938D] bg-[#F4F7F5] border border-[#DDE5DF]">
        <span>—</span>
      </span>
    );
  }

  // Normalisasi string (misal "Sudah_Close", "sudah_close", "Sudah Close" -> "sudah_close")
  const normalizedKey = status.trim().toLowerCase().replace(/[\s-]+/g, "_");

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG[normalizedKey] || {
      label: status.replace(/_/g, " "),
      color: "text-[#16A34A]",
      bg: "bg-[#F0FDF4]",
      border: "border-[#86EFAC]",
    };

  const isMd = size === "md";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold border transition-colors ${config.bg} ${config.color} ${config.border} ${
        isMd ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]"
      }`}
    >
      <span className="truncate">{config.label}</span>
    </span>
  );
}
