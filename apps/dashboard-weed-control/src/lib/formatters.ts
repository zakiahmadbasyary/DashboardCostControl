// Helper Formatter Indonesia untuk Dashboard Weed Control

export function formatCurrencyRp(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumberId(
  val: number | null | undefined,
  decimals = 0,
  fixedDecimals = false
): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: fixedDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatDecimal2(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDecimal4(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(val);
}

export function formatRatioId(
  val: number | null | undefined,
  decimals = 2,
  suffix = ""
): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "-";
  const numStr = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(val);
  return suffix ? `${numStr} ${suffix}` : numStr;
}

export function formatDateId(val: Date | string | null | undefined): string {
  if (!val) return "-";
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(val: Date | string | null | undefined): string {
  if (!val) return "-";
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format tanggal Indonesia (cukup tanggal tanpa jam)
 * Contoh: "9 Nov 2026"
 */
export function formatDateIndo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}
