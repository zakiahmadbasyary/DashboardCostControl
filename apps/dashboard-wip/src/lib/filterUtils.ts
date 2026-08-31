export const ZN_NAME_MAP: Record<string, number> = {
  "land preparation": 1,
  "seedling allocation": 2,
  "planting": 3,
  "road and drainage": 4,
  "fertilization": 5,
  "weed control": 6,
  "plant pest control": 7,
  "forcing": 8,
  "pre harvesting": 9,
  "harvesting": 10,
  "observation": 11,
  "plant selection": 12,
  "springkle/irrigation": 13,
  "sprinkle/irrigation": 13,
  "guard/pull/labour transportasion": 14,
  "guard/pull/labour transportation": 14,
  "others": 15,
  "land rehabilitation": 16,
  "road and drainage allocation": 17,
  "deepenning lagoon allocation": 18,
};

export const ZN_CODE_TO_NAME: Record<string, string> = {
  ZN01: "Land Preparation",
  ZN02: "Seedling Allocation",
  ZN03: "Planting",
  ZN04: "Road and Drainage",
  ZN05: "Fertilization",
  ZN06: "Weed Control",
  ZN07: "Plant Pest Control",
  ZN08: "Forcing",
  ZN09: "Pre Harvesting",
  ZN10: "Harvesting",
  ZN11: "Observation",
  ZN12: "Plant Selection",
  ZN13: "Sprinkle/Irrigation",
  ZN14: "Guard/Pull/Labour Transportation",
  ZN15: "Others",
  ZN16: "Land Rehabilitation",
  ZN17: "Road and Drainage Allocation",
  ZN18: "Deepening Lagoon Allocation",
};

export function getZnDetail(gcName: string | null | undefined): { znCode: string; description: string } | null {
  if (!gcName) return null;
  const raw = gcName.trim();
  const lower = raw.toLowerCase();

  const znMatch = raw.match(/^zn[\s-_]*(\d+)/i);
  if (znMatch) {
    const num = parseInt(znMatch[1], 10);
    const codeKey = `ZN${num < 10 ? '0' + num : num}`;
    const desc = ZN_CODE_TO_NAME[codeKey] || raw;
    return { znCode: codeKey, description: desc };
  }

  for (const [codeKey, desc] of Object.entries(ZN_CODE_TO_NAME)) {
    if (lower === desc.toLowerCase() || lower.includes(desc.toLowerCase())) {
      return { znCode: codeKey, description: desc };
    }
  }

  return null;
}

export function normalizeGroupCostName(rawName: string | null | undefined): string {
  if (!rawName) return "";
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("springkle") || lower.includes("sprinkle")) {
    return "Springkle/Irrigation";
  }
  if (lower.includes("guard/pull/labour transport")) {
    return "Guard/Pull/Labour Transportation";
  }

  return trimmed;
}

export function getGroupCostVariants(gc: string): string[] {
  if (!gc) return [];
  const lower = gc.trim().toLowerCase();

  if (lower.includes("springkle") || lower.includes("sprinkle")) {
    return [
      "springkle/irrigation",
      "sprinkle/irrigation",
      "Springkle/Irrigation",
      "Sprinkle/Irrigation",
    ];
  }
  if (lower.includes("guard/pull/labour transport")) {
    return [
      "guard/pull/labour transportasion",
      "guard/pull/labour transportation",
      "Guard/Pull/Labour Transportasion",
      "Guard/Pull/Labour Transportation",
    ];
  }

  return [gc];
}

export function getZnSortOrder(item: { groupCost?: string; codeSbt?: string }): number {
  const gcText = (item.groupCost || "").trim().toLowerCase();
  const fullText = `${item.groupCost || ""} ${item.codeSbt || ""}`.toLowerCase().trim();

  // 1. Try finding ZN + digits (e.g. ZN01, ZN-02, ZN 3)
  const znMatch = fullText.match(/zn[\s-_]*(\d+)/i);
  if (znMatch) {
    return parseInt(znMatch[1], 10);
  }

  // 2. Exact match check
  if (gcText && ZN_NAME_MAP[gcText] !== undefined) {
    return ZN_NAME_MAP[gcText];
  }

  // 3. Match longer keys first to prevent shorter substrings (like "road and drainage") from matching prematurely
  const sortedKeys = Object.keys(ZN_NAME_MAP).sort((a, b) => b.length - a.length);
  for (const name of sortedKeys) {
    if (fullText.includes(name)) {
      return ZN_NAME_MAP[name];
    }
  }

  const numMatch = fullText.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return 999;
}

export function matchesStatus(itemStatus: string | null | undefined, filterStatus: string | null | undefined): boolean {
  if (!filterStatus || filterStatus === "all") return true;
  if (!itemStatus) return false;

  if (filterStatus === "NS") {
    return itemStatus === "NSFC" || itemStatus === "NSSC";
  }

  return itemStatus === filterStatus;
}

export function matchesGroupCost(
  item: { groupCost?: string | null; keteranganGroupCost?: string | null },
  filterGroupCost: string | null | undefined
): boolean {
  if (!filterGroupCost || filterGroupCost === "all") return true;

  const gc = (item.groupCost || "").trim();
  const ket = (item.keteranganGroupCost || "").trim();

  // Exclude Land Rehab
  if (
    filterGroupCost === "exclude_land_rehab" ||
    filterGroupCost === "Exclude Land Rehab"
  ) {
    return (
      ket.toLowerCase() !== "land rehabilitation" &&
      gc.toLowerCase() !== "land rehabilitation"
    );
  }

  // Direct (ZN codes or Direct)
  if (filterGroupCost === "direct" || filterGroupCost === "Direct") {
    return (
      gc.toUpperCase().startsWith("ZN") ||
      ket.toUpperCase().startsWith("ZN") ||
      gc.toLowerCase() === "direct" ||
      ket.toLowerCase() === "direct"
    );
  }

  // Indirect (ZW codes or Indirect)
  if (filterGroupCost === "indirect" || filterGroupCost === "Indirect") {
    return (
      gc.toUpperCase().startsWith("ZW") ||
      ket.toUpperCase().startsWith("ZW") ||
      gc.toLowerCase() === "indirect" ||
      ket.toLowerCase() === "indirect"
    );
  }

  // Specific Group Cost name (normalized match)
  const filterNorm = normalizeGroupCostName(filterGroupCost);
  const gcNorm = normalizeGroupCostName(gc);
  const ketNorm = normalizeGroupCostName(ket);

  return (
    gc === filterGroupCost ||
    ket === filterGroupCost ||
    (filterNorm !== "" && (gcNorm === filterNorm || ketNorm === filterNorm))
  );
}
