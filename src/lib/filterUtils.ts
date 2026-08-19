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

  // Specific Group Cost name
  return gc === filterGroupCost || ket === filterGroupCost;
}
