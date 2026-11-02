/**
 * Utility pembersih teks dan identifier dari whitespace tak kasat mata
 * (NBSP \u00A0, zero-width spaces, line breaks, tabs, dsb)
 */

// Regex untuk mendeteksi semua varian whitespace unicode (NBSP, zero-width, BOM, fullwidth, dsb)
const UNICODE_WHITESPACE_REGEX = /[\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000\uFEFF]/g;

/**
 * Membersihkan teks umum:
 * - Mengganti semua whitespace unicode tak kasat mata dengan spasi biasa
 * - Menggabungkan spasi bertumpuk menjadi 1 spasi
 * - Menghilangkan spasi di awal dan akhir (.trim())
 */
export function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(UNICODE_WHITESPACE_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Versi nullable dari cleanStr: mengembalikan null jika string kosong.
 */
export function cleanNullableStr(val: unknown): string | null {
  const s = cleanStr(val);
  return s.length > 0 ? s : null;
}

/**
 * Membersihkan kode atau identifier unik:
 * (Nomor PR, Nomor PO, Capex No, WBS, MO, IO, Kode Approver, Cost Center, PGR)
 * - Menghapus seluruh jenis spasi (baik spasi biasa maupun unicode tak kasat mata)
 * - Mencegah mismatch pencocokan antar tabel yang disebabkan karakter tersembunyi
 */
export function cleanIdentifier(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(UNICODE_WHITESPACE_REGEX, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Versi nullable dari cleanIdentifier: mengembalikan null jika string kosong.
 */
export function cleanNullableIdentifier(val: unknown): string | null {
  const s = cleanIdentifier(val);
  return s.length > 0 ? s : null;
}
