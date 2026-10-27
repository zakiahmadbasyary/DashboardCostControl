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
