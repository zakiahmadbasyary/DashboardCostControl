/**
 * Utility Parser & Data Transformer untuk Weed Control GGP
 * Menangani format angka Indonesia (ribuan titik, desimal koma) dan variasi tanggal Excel
 * Sesuai spesifikasi: apps/dashboard-weed-control/doc/prompt_skema_database_weed_control_ggp.md
 */

// Kamus nama bulan Indonesia ke angka bulan (0-indexed)
const INDO_MONTHS: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  maret: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  agu: 7,
  agust: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

/**
 * Normalisasi dan sanitasi kode lokasi perkebunan
 * Menghilangkan whitespace dan memastikan huruf kapital (misal: " aw0101 " -> "AW0101")
 */
export function cleanLokasi(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).trim().toUpperCase();
}

/**
 * Sanitasi string umum: trim whitespace, ubah string kosong atau tanda strip "-" menjadi null
 */
export function cleanString(val: any): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === "" || s === "-" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") {
    return null;
  }
  return s;
}

/**
 * Parsing Angka Format Indonesia & Excel
 * Menangani:
 * - Format ribuan Indonesia: "32.430.176" -> 32430176
 * - Format desimal koma Indonesia: "12,14" -> 12.14, "1,20" -> 1.2
 * - Format campuran: "12.237.000,50" -> 12237000.5
 * - Format standar internasional: "12,237,000.50" -> 12237000.5
 * - Tanda kurung akuntansi untuk negatif: "(1250)" -> -1250
 * - Tanda strip "-" atau sel kosong -> null (atau defaultVal)
 * - Angka 0 atau "0" -> TETAP DIPERTAHANKAN sebagai 0 (aturan ketat bisnis)
 */
export function parseIndonesianNumber(
  val: any,
  defaultVal: number | null = null
): number | null {
  if (val === null || val === undefined) return defaultVal;

  // Jika sudah bertipe number
  if (typeof val === "number") {
    return isNaN(val) ? defaultVal : val;
  }

  let s = String(val).trim();
  if (!s || s === "-" || s === "—" || s === "–" || s.toLowerCase() === "null") {
    return defaultVal;
  }

  // Cek apakah angka 0 literal
  if (s === "0" || s === "0,0" || s === "0.0" || s === "0,00" || s === "0.00") {
    return 0;
  }

  // Tangani format negatif akuntansi dalam tanda kurung: (12.500) -> -12500
  let isNegative = false;
  if (s.startsWith("(") && s.endsWith(")")) {
    isNegative = true;
    s = s.substring(1, s.length - 1).trim();
  } else if (s.startsWith("-")) {
    isNegative = true;
    s = s.substring(1).trim();
  }

  // Bersihkan simbol mata uang (Rp, IDR), huruf satuan (Ha, Lt, %, dll.) dan spasi
  s = s.replace(/[^0-9.,]/g, "");
  if (!s) return defaultVal;

  if (s.includes(".") && s.includes(",")) {
    const lastDot = s.lastIndexOf(".");
    const lastComma = s.lastIndexOf(",");

    if (lastComma > lastDot) {
      // Format Indonesia: 12.430.176,50 -> buang titik, koma jadi titik
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // Format US: 12,430,176.50 -> buang koma
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    // Hanya ada koma: bisa berupa desimal ("12,14") atau ribuan US ("1,234")
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length !== 3) {
      // Koma desimal: "12,14" -> 12.14, "0,0405" -> 0.0405
      s = s.replace(",", ".");
    } else if (parts.length > 2) {
      // Koma ribuan: 1,234,567 -> 1234567
      s = s.replace(/,/g, "");
    } else if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      // Kemungkinan format ribuan US 1,800 -> 1800
      s = s.replace(/,/g, "");
    } else {
      s = s.replace(",", ".");
    }
  } else if (s.includes(".")) {
    // Hanya ada titik: bisa berupa ribuan Indonesia ("32.430.176" atau "1.800") atau desimal US ("12.14")
    const parts = s.split(".");
    if (parts.length > 2) {
      // Lebih dari 1 titik -> pasti titik ribuan Indonesia: 32.430.176 -> 32430176
      s = s.replace(/\./g, "");
    } else if (parts.length === 2) {
      // 1 titik: jika tepat 3 digit di belakang titik dan bagian depan 1-3 digit (misal: "1.800" atau "25.000")
      // dan bukan pecahan desimal
      if (parts[1].length === 3 && parts[0].length >= 1 && parts[0].length <= 3) {
        s = s.replace(/\./g, "");
      }
      // Jika di luar itu, anggap desimal standar: "12.14" -> 12.14
    }
  }

  const num = parseFloat(s);
  if (isNaN(num)) return defaultVal;
  return isNegative ? -num : num;
}

/**
 * Parsing Nilai Integer (misal umur, umur_forcing)
 * Mendukung nilai negatif seperti -6
 */
export function parseInteger(val: any, defaultVal: number | null = null): number | null {
  const num = parseIndonesianNumber(val, defaultVal);
  if (num === null) return defaultVal;
  return Math.round(num);
}

/**
 * Parsing Tanggal Excel yang Sangat Fleksibel
 * Mendukung:
 * 1. JavaScript Date instance
 * 2. Excel Serial Date Number (misal: 45431 -> 19 May 2024) dengan offset leap-year bug 25569
 * 3. Format tanggal angka: "DD/MM/YYYY", "DD-MM-YYYY", "DD.MM.YYYY", "YYYY-MM-DD"
 * 4. Format tanggal teks Indonesia & Inggris:
 *    - "19 May 2025", "19 Mei 2025"
 *    - "15 Agustus 2024", "15-Agu-2024"
 *    - "01 Januari 2026"
 */
export function parseExcelDate(val: any): Date | null {
  if (!val) return null;

  // Jika sudah instance Date
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // Jika serial number Excel (integer atau float representasi hari sejak 1899-12-30)
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return null;
    // Excel base epoch offset: 25569 hari ke Unix epoch (1970-01-01)
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof val === "string") {
    let s = val.trim();
    if (!s || s === "-" || s.toLowerCase() === "null") return null;

    // Jika string berisi angka serial murni (misal: "45431")
    if (/^\d{5}(\.\d+)?$/.test(s)) {
      const serial = parseFloat(s);
      return parseExcelDate(serial);
    }

    // Format DD/MM/YYYY, DD-MM-YYYY, atau DD.MM.YYYY
    const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }

    // Format YYYY-MM-DD atau YYYY/MM/DD
    const ymdMatch = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }

    // Format Tanggal Teks: "19 May 2025", "19 Mei 2025", "15-Agustus-2024"
    const textDateMatch = s.match(/^(\d{1,2})[\s\-\/\.]+([a-zA-Z]+)[\s\-\/\.]+(\d{4})$/);
    if (textDateMatch) {
      const day = parseInt(textDateMatch[1], 10);
      const monthStr = textDateMatch[2].toLowerCase();
      const year = parseInt(textDateMatch[3], 10);

      if (monthStr in INDO_MONTHS) {
        const month = INDO_MONTHS[monthStr];
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
    }

    // Fallback native Date.parse
    const fallbackDate = new Date(s);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }

  return null;
}

/**
 * Deteksi apakah sebuah baris Excel merupakan baris header berulang
 * Pada Data Aktivitas Excel sering kali baris header tercetak ulang di tengah data
 */
export function isHeaderRow(row: Record<string, any>): boolean {
  if (!row) return false;
  const values = Object.values(row).map((v) => String(v || "").toLowerCase().trim());
  return (
    values.includes("lokasi") &&
    (values.includes("aktivitas") || values.includes("kode") || values.includes("status"))
  );
}

/**
 * Ekstraksi Transformasi Wide-to-Long untuk Tabel cost_umur
 * Mengambil kolom "Umur 1" s/d "Umur 20" dari baris Data Lokasi Excel.
 * Aturan:
 * - Nilai kosong atau "-" diabaikan (tidak dibuat baris)
 * - Nilai angka 0 TETAP DISIMPAN
 */
export function extractCostUmurRows(
  lokasi: string,
  row: Record<string, any>
): Array<{ lokasi: string; umur: number; cost: number }> {
  const result: Array<{ lokasi: string; umur: number; cost: number }> = [];
  const cleanLoc = cleanLokasi(lokasi);
  if (!cleanLoc) return result;

  // Scan kunci-kunci pada baris
  for (let umur = 1; umur <= 20; umur++) {
    // Variasi penamaan kolom: "Umur 1", "umur 1", "Umur1", "Umur_1"
    const regex = new RegExp(`^umur[\\s_]?${umur}$`, "i");
    const matchingKey = Object.keys(row).find((k) => regex.test(k.trim()));

    if (matchingKey) {
      const rawVal = row[matchingKey];
      // Lewati jika kosong atau strip "-"
      if (
        rawVal === null ||
        rawVal === undefined ||
        String(rawVal).trim() === "" ||
        String(rawVal).trim() === "-"
      ) {
        continue;
      }

      const costNum = parseIndonesianNumber(rawVal, null);
      if (costNum !== null) {
        result.push({
          lokasi: cleanLoc,
          umur,
          cost: costNum,
        });
      }
    }
  }

  return result;
}

/**
 * Ekstraksi Kolom Material Dinamis untuk Tabel data_material
 * Pada Data Timeline Excel, kolom-kolom setelah kolom "Material" berisi kuantitas herbisida/pestisida.
 * Aturan:
 * - Nilai > 0 disimpan
 * - Nilai angka 0 TETAP DISIMPAN
 * - Nilai "-", kosong, atau null DIABAIKAN (tidak dibuat baris)
 */
export function extractDataMaterialRows(
  timelineId: bigint,
  row: Record<string, any>,
  materialColumnNames: string[]
): Array<{ timelineId: bigint; namaMaterial: string; quantity: number }> {
  const result: Array<{ timelineId: bigint; namaMaterial: string; quantity: number }> = [];

  for (const colName of materialColumnNames) {
    if (!(colName in row)) continue;
    const rawVal = row[colName];

    // Abaikan jika strip "-", kosong, atau null
    if (
      rawVal === null ||
      rawVal === undefined ||
      String(rawVal).trim() === "" ||
      String(rawVal).trim() === "-"
    ) {
      continue;
    }

    const qty = parseIndonesianNumber(rawVal, null);
    if (qty !== null) {
      result.push({
        timelineId,
        namaMaterial: colName.trim(),
        quantity: qty,
      });
    }
  }

  return result;
}

