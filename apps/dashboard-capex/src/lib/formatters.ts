/**
 * Prioritas tampilan IO - WBS - MO:
 * Tampilkan WBS jika terisi; jika tidak, MO jika terisi; jika keduanya kosong, IO; jika semuanya kosong, "—".
 */
export function getIoWbsMoDisplay(item?: {
  wbs?: string | null;
  mo?: string | null;
  io?: string | null;
} | null): { value: string; type: "WBS" | "MO" | "IO" | "NONE" } {
  if (!item) return { value: "—", type: "NONE" };

  const wbsTrimmed = item.wbs?.trim();
  if (wbsTrimmed) return { value: wbsTrimmed, type: "WBS" };

  const moTrimmed = item.mo?.trim();
  if (moTrimmed) return { value: moTrimmed, type: "MO" };

  const ioTrimmed = item.io?.trim();
  if (ioTrimmed) return { value: ioTrimmed, type: "IO" };

  return { value: "—", type: "NONE" };
}

/**
 * Format angka ke mata uang Rupiah (IDR)
 */
export function formatCurrencyRp(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Format angka dengan pemisah ribuan standar Indonesia tanpa simbol Rp
 */
export function formatNumberId(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "—";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Perhitungan aman Unit Price: Total.amount / Total.quantity
 * Menghindari Infinity, NaN, atau division by zero.
 */
export function calculateUnitPrice(
  amount: number | null | undefined,
  quantity: number | null | undefined
): { raw: number | null; formatted: string } {
  if (
    amount == null ||
    quantity == null ||
    isNaN(amount) ||
    isNaN(quantity) ||
    quantity <= 0
  ) {
    return { raw: null, formatted: "—" };
  }

  const unitPrice = amount / quantity;
  if (!isFinite(unitPrice) || isNaN(unitPrice)) {
    return { raw: null, formatted: "—" };
  }

  return {
    raw: unitPrice,
    formatted: formatCurrencyRp(unitPrice),
  };
}

/**
 * Format tanggal Indonesia
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

/**
 * Format tanggal dan waktu Indonesia lengkap dengan jam (WIB)
 * Contoh: "02 Nov 2026, 15:34 WIB"
 */
export function formatDateTimeIndo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);

    const dateFormatted = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timeFormatted = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(".", ":");

    return `${dateFormatted}, ${timeFormatted} WIB`;
  } catch {
    return String(dateStr);
  }
}

