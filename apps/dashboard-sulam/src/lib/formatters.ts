// Formatters lokal Indonesia sesuai standar PRD Frontend SULAM

export function formatCurrencyRp(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
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
  if (val === null || val === undefined || isNaN(val)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: fixedDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatDecimal2(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatRatioId(
  val: number | null | undefined,
  decimals = 1,
  suffix = ""
): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  const numStr = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(val);
  return suffix ? `${numStr} ${suffix}` : numStr;
}

/**
 * Format tanggal Indonesia (cukup tanggal tanpa jam)
 * Contoh: "2 Nov 2026"
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

