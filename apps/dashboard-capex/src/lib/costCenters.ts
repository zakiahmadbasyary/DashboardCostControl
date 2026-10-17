/**
 * Mapping kamus Kode Cost Center ke Keterangan/Arti
 */
export const COST_CENTER_MAP: Record<string, string> = {
  "10PPG1FC99": "Common Field Support PG1",
  "10PPG1CO99": "Common PG1",
  "10PPG1PP01": "PPIC PG1",
  "10PPG1WC99": "Common Wilayah PG1",
  "10PPG1LP01": "Land Preparation PG1",
  "10PSS1EQ01": "BSC PG1",
  "10PRGU0001": "Common Guava PG1",
  "10PNPDP199": "Common Banana PG1",
  "10PNPBLDC1": "Leaf Disease Control",
  "10PNPNDP01": "Banana Division 04",
  "10PPFFPE01": "Common Pepaya",
  "10PPG1KP99": "Kelapa Pandan",
  "10PPG1FQ14": "SPE PG1",
  "10PPG1FQ06": "Implement Irrigator",
  "10PPG1FQ13": "SPC PG1",
  "10PNECFQ01": "Engine Cummin Banana",
  "10PPG1MC99": "Common PM",
  "10PPG1DR01": "Drone PG1",
};

/**
 * Mendaftarkan / memperbarui kamus Cost Center secara dinamis (misal dari database/API)
 */
export function registerCostCenters(map: Record<string, string>) {
  if (map && typeof map === "object") {
    Object.assign(COST_CENTER_MAP, map);
  }
}

/**
 * Mengambil nama/arti keterangan Cost Center dari kodenya.
 * Jika kode tidak terdaftar dalam kamus, kembalikan kodenya sendiri.
 */
export function getCostCenterLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const trimmed = code.trim();
  return COST_CENTER_MAP[trimmed] || trimmed;
}

/**
 * Mengambil label lengkap format: "Keterangan (Kode)"
 */
export function getCostCenterFullLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const trimmed = code.trim();
  const label = COST_CENTER_MAP[trimmed];
  if (!label) return trimmed;
  return `${label} (${trimmed})`;
}

