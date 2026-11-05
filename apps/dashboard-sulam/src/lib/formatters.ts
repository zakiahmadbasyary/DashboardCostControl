// Formatters lokal Indonesia sesuai standar PRD Frontend SULAM

export function formatCurrencyRp(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumberId(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
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

