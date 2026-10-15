import React from "react";
import {
  AlertCircle,
  Clock,
  Stamp,
  ShoppingCart,
  Lock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

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
    icon: React.ElementType;
    description: string;
  }
> = {
  "Belum Created": {
    label: "Belum Created",
    color: "text-[#5F6B63]",
    bg: "bg-[#F4F7F5]",
    border: "border-[#DDE5DF]",
    icon: AlertCircle,
    description: "Belum diajukan ke proses approval",
  },
  "Sudah Created": {
    label: "Sudah Created",
    color: "text-[#B45309]",
    bg: "bg-[#FEF6E5]",
    border: "border-[#FCDFA8]",
    icon: Clock,
    description: "Pengajuan sedang dalam proses approval",
  },
  "Final Approve": {
    label: "Final Approve",
    color: "text-[#0369A1]",
    bg: "bg-[#E5F6FC]",
    border: "border-[#B8E4F4]",
    icon: Stamp,
    description: "Semua approver telah menyetujui",
  },
  "Sudah PO": {
    label: "Sudah PO",
    color: "text-[#6D28D9]",
    bg: "bg-[#F3EEFF]",
    border: "border-[#D8C8FB]",
    icon: ShoppingCart,
    description: "Purchase Order telah diterbitkan",
  },
  "Sudah Close": {
    label: "Sudah Close",
    color: "text-[#16823B]",
    bg: "bg-[#EAF3EC]",
    border: "border-[#CBE0D1]",
    icon: Lock,
    description: "Proyek CAPEX telah ditutup",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#89938D] bg-[#F4F7F5] border border-[#DDE5DF]">
        <HelpCircle className="w-2.5 h-2.5" />
        <span>—</span>
      </span>
    );
  }

  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "text-[#5F6B63]",
    bg: "bg-[#F4F7F5]",
    border: "border-[#DDE5DF]",
    icon: CheckCircle2,
    description: status,
  };

  const Icon = config.icon;
  const isMd = size === "md";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors ${config.bg} ${config.color} ${config.border} ${
        isMd ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]"
      }`}
      title={config.description}
    >
      <Icon className={isMd ? "w-3.5 h-3.5 shrink-0" : "w-3 h-3 shrink-0"} />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
