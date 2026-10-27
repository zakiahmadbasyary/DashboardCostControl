/**
 * Filter umum visibilitas OPEX untuk query Summary dan DataActual/DataBudget.
 * Memastikan Cost Center atau Cost Element yang di-hide (isview: false) pada mastersheet
 * sepenuhnya dikeluarkan dari perhitungan grafik bulanan, tren per PG, KPI, dan tabel breakdown.
 */
export const OPEX_VISIBILITY_FILTER = {
  AND: [
    { OR: [{ costcenterRef: { isview: true } }, { costcenter: null }] },
    { OR: [{ ce2Ref: { isview: true } }, { ce2: null }] },
  ],
};

/**
 * Menormalkan kode Cost Center antar PG agar fungsi operasional yang sama
 * (misal: 10PPG1CO99, 10PPG2CO99, 10PPG3CO99) dapat disejajarkan dalam satu baris fungsi generik (Solusi C).
 */
export function toGenericCostCenter(costcenter: string, deskripsi?: string | null) {
  // Pola kode: 10PPG1... -> 10PPGx... atau 10PSS1... -> 10PSSx...
  const genericCode = costcenter.replace(/^(10P(?:PG|SS))[123]/, "$1x");

  // Bersihkan deskripsi dari akhiran PG1/PG2/PG3, SF1/SF2/SF3, P1/P2/P3
  const rawDesc = (deskripsi || costcenter).trim();
  let genericDesc = rawDesc
    .replace(/[\s\-_]*(?:PG|SF|P)[123]$/i, "")
    .replace(/[\s\-_]*PG$/i, "")
    .trim();

  // Standarisasi variasi deskripsi agar bersih dan seragam
  if (genericDesc === "CMN") genericDesc = "CMN PG";
  if (genericDesc.toLowerCase().includes("field supprt")) genericDesc = "Cmn Field Support";
  if (genericDesc === "Springkle Electric 1" || genericDesc === "Sprinkle Electric 2") genericDesc = "Sprinkle Electric";
  if (
    genericDesc === "CMN Spray Forcing 1" ||
    genericDesc === "CMN Spray Forcing 2" ||
    genericDesc === "CMN Spray Forcing 3"
  ) {
    genericDesc = "CMN Spray Forcing";
  }
  if (genericDesc.toLowerCase().startsWith("pl spray forc")) genericDesc = "Pl Spray Forcing";
  if (
    genericDesc.toLowerCase().includes("plant maint") ||
    genericDesc.toLowerCase().includes("plnt maint")
  ) {
    genericDesc = "Cmn Plant Maintenance";
  }

  return { genericCode, genericDesc };
}
