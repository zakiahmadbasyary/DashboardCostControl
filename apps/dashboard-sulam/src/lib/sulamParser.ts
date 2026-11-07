// Helper Parser & Logika Bisnis SULAM sesuai doc/database.md

export interface SulamRawInput {
  tanggal_realisasi?: any;
  spk_id?: any;
  plantation_group?: any;
  wilayah?: any;
  lokasi?: any;
  status_tanaman?: any;
  tanggal_spk?: any;
  kode_aktivitas?: any;
  deskripsi?: any;
  jenis_data?: any;
  group_bahan_alat?: any;
  kode_bahan_alat_lainlain?: any;
  deskripsi_bahan_alat_lainlain?: any;
  resource_bahan_alat?: any;
  hasil_efektif?: any;
  satuan_hasil?: any;
  total_realisasi_biaya?: any;
  referensi_lokasi?: any;
  cost_center_name?: any;
  cost_working_hour?: any;
  indeks_biaya?: any;
  mandor?: any;
  pas_document?: any;
  order_no?: any;
  act_cost_group?: any;
  [key: string]: any;
}

export interface ParsedSulamRow {
  tanggalRealisasi: Date;
  spkId: string | null;
  plantationGroup: string | null;
  wilayah: string;
  lokasi: string | null;
  statusTanaman: string | null;
  tanggalSpk: Date | null;
  kodeAktivitas: string | null;
  deskripsi: string | null;
  jenisData: string;
  groupBahanAlat: string | null;
  kodeBahanAlatLainlain: string | null;
  deskripsiBahanAlatLainlain: string | null;
  resourceBahanAlat: number;
  hasilEfektif: number;
  satuanHasil: string | null;
  totalRealisasiBiaya: number;
  referensiLokasi: string | null;
  costCenterName: string | null;
  costWorkingHour: number;
  indeksBiaya: number;
  mandor: string | null;
  pasDocument: string | null;
  orderNo: string | null;
  actCostGroup: string | null;

  // Derivasi Kolom
  jenis: "Upah" | "Material";
  pg: "PG1" | "PG2" | "PG3";
  year: number;
  month: number;
  kode: string;
  keyMandor: string | null;
}

export interface DataMandorData {
  keyMandor: string;
  tanggalRealisasi: Date;
  mandor: string;
  pg: string;
  wilayah: string;
  year: number;
  month: number;
  tk: number;
  batang: number;
  batangPerTk: number;
}

export interface SummarySulamData {
  kode: string;
  pg: string;
  wilayah: string;
  year: number;
  month: number;
  material: number;
  upah: number;
  batang: number;
  jumlahTk: number;
  luas: number;
}

/**
 * Parsing angka format Indonesia (titik sebagai ribuan, koma sebagai desimal)
 * Contoh: "12.237.000" -> 12237000, "0,040" -> 0.040, "1.800" -> 1800
 */
export function parseIndonesianNumber(val: any, defaultVal = 0): number {
  if (val === null || val === undefined || val === "") return defaultVal;
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;

  let s = String(val).trim();
  if (!s) return defaultVal;

  // Bersihkan teks mata uang, spasi, hanya sisakan angka, titik, koma, minus
  s = s.replace(/[^0-9.,-]/g, "");
  if (!s) return defaultVal;

  if (s.includes(".") && s.includes(",")) {
    // Format: 12.237.000,50 -> buang titik, ganti koma dengan titik
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // Format desimal koma: 0,040 -> 0.040
    s = s.replace(",", ".");
  } else if (s.includes(".")) {
    // Format titik: bila ada lebih dari 1 titik (12.237.000) atau 1 titik diikuti 3 digit (1.800)
    const parts = s.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      s = s.replace(/\./g, "");
    }
  }

  const num = parseFloat(s);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Parsing tanggal dari berbagai variasi Excel: serial number, ISO string, DD/MM/YYYY
 */
export function parseExcelDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;

  if (typeof val === "number") {
    // Konversi serial number Excel (epoch 1900 minus offset)
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;

    // Cek format DD/MM/YYYY atau DD-MM-YYYY
    const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Klasifikasi jenis_data ke jenis induk (Upah atau Material).
 * Transaksi Reverse tetap dihitung positif.
 */
export function deriveJenis(jenisData: string): "Upah" | "Material" {
  const s = String(jenisData || "").trim().toLowerCase();
  if (s.includes("upah")) return "Upah";
  return "Material";
}

/**
 * Normalisasi kode wilayah menjadi standar AW01 - AW23
 */
export function normalizeWilayah(val: string): string {
  const s = String(val || "").trim().toUpperCase();
  const match = s.match(/(\d{1,2})/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 23) {
      return `AW${num.toString().padStart(2, "0")}`;
    }
  }
  return s.startsWith("AW") ? s.substring(0, 4) : "AW01";
}

/**
 * Pemetaan Wilayah ke Plantation Group (PG):
 * AW01-AW07 -> PG1
 * AW08-AW15 -> PG2
 * AW16-AW23 -> PG3
 */
export function derivePG(wilayah: string): "PG1" | "PG2" | "PG3" {
  const norm = normalizeWilayah(wilayah);
  const num = parseInt(norm.replace(/\D/g, ""), 10);

  if (num >= 1 && num <= 7) return "PG1";
  if (num >= 8 && num <= 15) return "PG2";
  if (num >= 16 && num <= 23) return "PG3";
  return "PG1";
}

/**
 * Ambil nilai dari baris objek Excel secara case-insensitive & toleran terhadap spasi / simbol
 */
export function getVal(row: Record<string, any>, possibleKeys: string[]): any {
  if (!row || typeof row !== "object") return undefined;

  const normalizedKeys: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    const clean = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    normalizedKeys[clean] = row[k];
  }

  for (const target of possibleKeys) {
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedKeys[cleanTarget] !== undefined && normalizedKeys[cleanTarget] !== null) {
      return normalizedKeys[cleanTarget];
    }
  }
  return undefined;
}

/**
 * Pembatas panjang string agar tidak melampaui ukuran VarChar PostgreSQL
 */
export function limitStr(val: any, maxLen: number, defaultVal: string | null = null): string | null {
  if (val === null || val === undefined) return defaultVal;
  const s = String(val).trim();
  if (!s) return defaultVal;
  return s.substring(0, maxLen);
}

/**
 * Proses dan validasi seluruh baris transaksi Excel menjadi ParsedSulamRow & SummarySulamData
 */
export function processSulamRows(rawRows: Record<string, any>[]): {
  validRows: ParsedSulamRow[];
  summaryRows: SummarySulamData[];
  dataMandorRows: DataMandorData[];
  errors: { row: number; error: string }[];
} {
  const validRows: ParsedSulamRow[] = [];
  const errors: { row: number; error: string }[] = [];

  // Pass 1: Bangun kamus SPK_ID -> Mandor dari baris yang kolom mandor-nya terisi
  const spkToMandor = new Map<string, string>();
  for (const r of rawRows) {
    const rawSpk = limitStr(getVal(r, ["spk_id", "spk id", "no spk"]), 50);
    const rawMandor = limitStr(getVal(r, ["mandor", "nama mandor", "nama_mandor", "foreman"]), 100);
    if (rawSpk && rawMandor) {
      const spkKey = rawSpk.trim().toLowerCase();
      if (!spkToMandor.has(spkKey)) {
        spkToMandor.set(spkKey, rawMandor.trim());
      }
    }
  }

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    const rowNum = i + 2; // Asumsi baris 1 adalah header Excel

    const rawTglRealisasi = getVal(r, ["tanggal_realisasi", "tanggal realisasi", "tgl realisasi", "realisasi date"]);
    const tglRealisasi = parseExcelDate(rawTglRealisasi);
    if (!tglRealisasi) {
      errors.push({ row: rowNum, error: `Tanggal realisasi tidak valid: "${rawTglRealisasi}"` });
      continue;
    }

    const rawWilayah = getVal(r, ["wilayah", "region"]) || "AW01";
    const wilayah = normalizeWilayah(rawWilayah);
    const pg = derivePG(wilayah);

    const rawJenisData = String(getVal(r, ["jenis_data", "jenis data", "jenis transaksi"]) || "Material").trim();
    // Validasi jenis_data harus salah satu dari: Upah, Upah (Reverse), Material, Material (Reverse)
    let jenisData = rawJenisData;
    const lowerJD = rawJenisData.toLowerCase();
    if (lowerJD.includes("upah") && lowerJD.includes("reverse")) {
      jenisData = "Upah (Reverse)";
    } else if (lowerJD.includes("upah")) {
      jenisData = "Upah";
    } else if (lowerJD.includes("material") && lowerJD.includes("reverse")) {
      jenisData = "Material (Reverse)";
    } else {
      jenisData = "Material";
    }

    const jenis = deriveJenis(jenisData);
    const year = tglRealisasi.getFullYear();
    const month = tglRealisasi.getMonth() + 1; // 1 - 12
    const kode = `${pg}-${wilayah}-${year}-${month}`;

    const rawTglSpk = getVal(r, ["tanggal_spk", "tanggal spk", "tgl spk"]);
    const tanggalSpk = parseExcelDate(rawTglSpk);

    const resourceBahanAlat = parseIndonesianNumber(
      getVal(r, ["resource_bahan_alat", "resource bahan/alat", "resource bahan alat", "resource"])
    );
    const hasilEfektif = parseIndonesianNumber(
      getVal(r, ["hasil_efektif", "hasil efektif", "luas efektif", "luas"])
    );
    const totalRealisasiBiaya = parseIndonesianNumber(
      getVal(r, ["total_realisasi_biaya", "total realisasi biaya", "realisasi biaya", "total biaya", "biaya"])
    );
    const costWorkingHour = parseIndonesianNumber(
      getVal(r, ["cost_working_hour", "cost/working hour", "cost working hour"])
    );
    const indeksBiaya = parseIndonesianNumber(
      getVal(r, ["indeks_biaya", "index biaya/hasil effectif", "index biaya/hasil efektif", "index biaya"])
    );
    const rawSpk = limitStr(getVal(r, ["spk_id", "spk id", "no spk"]), 50);
    let mandor = limitStr(
      getVal(r, ["mandor", "nama mandor", "nama_mandor", "foreman"]),
      100
    );

    // Jika mandor kosong, cek apakah SPK_ID ada di kamus mandor
    if (!mandor && rawSpk) {
      const spkKey = rawSpk.trim().toLowerCase();
      if (spkToMandor.has(spkKey)) {
        mandor = spkToMandor.get(spkKey) || null;
      }
    }

    // Generate key_mandor otomatis (khusus PG1 yang memiliki data mandor)
    let keyMandor: string | null = null;
    if (pg === "PG1" && mandor) {
      const y = tglRealisasi.getFullYear();
      const m = String(tglRealisasi.getMonth() + 1).padStart(2, "0");
      const d = String(tglRealisasi.getDate()).padStart(2, "0");
      keyMandor = `${y}-${m}-${d}_${mandor.trim()}`;
    }

    const rowObj: ParsedSulamRow = {
      tanggalRealisasi: tglRealisasi,
      spkId: rawSpk,
      plantationGroup: limitStr(getVal(r, ["plantation_group", "plantation group"]), 50),
      wilayah,
      lokasi: limitStr(getVal(r, ["lokasi", "location"]), 50),
      statusTanaman: limitStr(getVal(r, ["status_tanaman", "status tanaman"]), 50),
      tanggalSpk,
      kodeAktivitas: limitStr(getVal(r, ["kode_aktivitas", "kode aktifitas", "kode aktivitas"]), 50),
      deskripsi: limitStr(getVal(r, ["deskripsi", "description", "keterangan"]), 1000),
      jenisData,
      groupBahanAlat: limitStr(getVal(r, ["group_bahan_alat", "group bahan/alat", "group bahan alat"]), 100),
      kodeBahanAlatLainlain: limitStr(getVal(r, ["kode_bahan_alat_lainlain", "kode bahan/alat/lainlain"]), 150),
      deskripsiBahanAlatLainlain: limitStr(getVal(r, ["deskripsi_bahan_alat_lainlain", "deskripsi bahan/alat/lainlain"]), 1000),
      resourceBahanAlat,
      hasilEfektif,
      satuanHasil: limitStr(getVal(r, ["satuan_hasil", "satuan hasil", "uom"]), 30, "HA"),
      totalRealisasiBiaya,
      referensiLokasi: limitStr(getVal(r, ["referensi_lokasi", "referensi lokasi"]), 150),
      costCenterName: limitStr(getVal(r, ["cost_center_name", "cost center name", "cost center"]), 150),
      costWorkingHour,
      indeksBiaya,
      mandor,
      pasDocument: limitStr(getVal(r, ["pas_document", "pas document"]), 100),
      orderNo: limitStr(getVal(r, ["order_no", "order", "order no"]), 100),
      actCostGroup: limitStr(getVal(r, ["act_cost_group", "act cost group"]), 100),

      jenis,
      pg,
      year,
      month,
      kode,
      keyMandor,
    };

    validRows.push(rowObj);
  }

  // 1. Hitung agregasi summary berdasarkan kode
  const summaryMap = new Map<string, SummarySulamData>();

  for (const item of validRows) {
    let sum = summaryMap.get(item.kode);
    if (!sum) {
      sum = {
        kode: item.kode,
        pg: item.pg,
        wilayah: item.wilayah,
        year: item.year,
        month: item.month,
        material: 0,
        upah: 0,
        batang: 0,
        jumlahTk: 0,
        luas: 0,
      };
      summaryMap.set(item.kode, sum);
    }

    if (item.jenis === "Material") {
      sum.material += item.totalRealisasiBiaya;
      sum.batang += item.resourceBahanAlat;
      sum.luas += item.hasilEfektif;
    } else if (item.jenis === "Upah") {
      sum.upah += item.totalRealisasiBiaya;
      sum.jumlahTk += item.resourceBahanAlat;
    }
  }

  const summaryRows = Array.from(summaryMap.values());

  // 2. Hitung agregasi data_mandor (khusus PG1)
  const mandorMap = new Map<
    string,
    {
      keyMandor: string;
      tanggalRealisasi: Date;
      mandor: string;
      pg: string;
      wilayah: string;
      year: number;
      month: number;
      tk: number;
      batang: number;
    }
  >();

  for (const item of validRows) {
    if (item.pg === "PG1" && item.keyMandor && item.mandor) {
      let mRecord = mandorMap.get(item.keyMandor);
      if (!mRecord) {
        mRecord = {
          keyMandor: item.keyMandor,
          tanggalRealisasi: item.tanggalRealisasi,
          mandor: item.mandor,
          pg: item.pg,
          wilayah: item.wilayah,
          year: item.year,
          month: item.month,
          tk: 0,
          batang: 0,
        };
        mandorMap.set(item.keyMandor, mRecord);
      }

      if (item.jenis === "Upah") {
        mRecord.tk += item.resourceBahanAlat;
      } else if (item.jenis === "Material") {
        mRecord.batang += item.resourceBahanAlat;
      }
    }
  }

  const dataMandorRows: DataMandorData[] = Array.from(mandorMap.values()).map((m) => {
    const batangPerTk = m.tk > 0 ? Number((m.batang / m.tk).toFixed(4)) : 0;
    return {
      keyMandor: m.keyMandor,
      tanggalRealisasi: m.tanggalRealisasi,
      mandor: m.mandor,
      pg: m.pg,
      wilayah: m.wilayah,
      year: m.year,
      month: m.month,
      tk: Number(m.tk.toFixed(4)),
      batang: Number(m.batang.toFixed(4)),
      batangPerTk,
    };
  });

  return { validRows, summaryRows, dataMandorRows, errors };
}
