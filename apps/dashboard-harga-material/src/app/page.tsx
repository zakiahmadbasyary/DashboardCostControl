"use client";

import React, { useState, useMemo } from "react";
import HargaMaterialDashboardHeader from "@/components/HargaMaterialDashboardHeader";
import MaterialFilters, { MaterialFilterState } from "@/components/MaterialFilters";
import MaterialSummaryCards from "@/components/MaterialSummaryCards";
import MaterialTrendChart, { CategoryTrend } from "@/components/MaterialTrendChart";
import MaterialTable, { MaterialItem } from "@/components/MaterialTable";
import MaterialDetailCard from "@/components/MaterialDetailCard";

// Mock Database of Master Material & Fluktuasi Logistik PG1
const INITIAL_MATERIALS: MaterialItem[] = [
  {
    idMaterial: "MAT-001",
    kodeMaterial: "PUP-NPK-01",
    namaMaterial: "Pupuk NPK 15-15-15 (Kujang / Petro)",
    kategori: "Pupuk & Nutrisi",
    uom: "Zak (50Kg)",
    hargaAcuan: 420000,
    hargaRealisasi: 445000,
    deviasiPercent: 5.95,
    statusFluktuasi: "naik",
    tglUpdate: "01 Okt 2026",
    vendorUtama: "PT Petrokimia / Distribusi PG1",
    spesifikasi: "Pupuk NPK majemuk formula 15-15-15 untuk nutrisi vegetatif dan generatif tanaman nanas/pisang PG1.",
  },
  {
    idMaterial: "MAT-002",
    kodeMaterial: "PUP-UREA-01",
    namaMaterial: "Pupuk Urea Prill Non-Subsidi",
    kategori: "Pupuk & Nutrisi",
    uom: "Zak (50Kg)",
    hargaAcuan: 380000,
    hargaRealisasi: 370000,
    deviasiPercent: -2.63,
    statusFluktuasi: "turun",
    tglUpdate: "02 Okt 2026",
    vendorUtama: "PT Pupuk Indonesia",
    spesifikasi: "Pupuk Nitrogen kadar 46% untuk pemeliharaan rutin pembesaran daun dan fasa Vegetatif S1/S2.",
  },
  {
    idMaterial: "MAT-003",
    kodeMaterial: "PUP-KCL-01",
    namaMaterial: "Pupuk KCL (MOP 60% K2O)",
    kategori: "Pupuk & Nutrisi",
    uom: "Zak (50Kg)",
    hargaAcuan: 510000,
    hargaRealisasi: 535000,
    deviasiPercent: 4.9,
    statusFluktuasi: "naik",
    tglUpdate: "28 Sep 2026",
    vendorUtama: "PT Mahkota Fertilizer",
    spesifikasi: "Pupuk Kalium konsentrasi tinggi untuk pengisian kadar gula (Brix) dan bobot buah panen PG1.",
  },
  {
    idMaterial: "MAT-004",
    kodeMaterial: "CHE-GLY-01",
    namaMaterial: "Herbisida Glifosat 480 SL",
    kategori: "Chemical & Pestisida",
    uom: "Liter",
    hargaAcuan: 85000,
    hargaRealisasi: 85000,
    deviasiPercent: 0.0,
    statusFluktuasi: "stabil",
    tglUpdate: "03 Okt 2026",
    vendorUtama: "PT Nufarm Indonesia",
    spesifikasi: "Herbisida sistemik purna tumbuh untuk pengendalian gulma berdaun sempit dan teki di lahan ratoon.",
  },
  {
    idMaterial: "MAT-005",
    kodeMaterial: "CHE-ETH-01",
    namaMaterial: "Ethephon 480 SL (ZPT Forcing)",
    kategori: "Chemical & Pestisida",
    uom: "Liter",
    hargaAcuan: 165000,
    hargaRealisasi: 178000,
    deviasiPercent: 7.88,
    statusFluktuasi: "naik",
    tglUpdate: "04 Okt 2026",
    vendorUtama: "PT Bayer Indonesia",
    spesifikasi: "Zat Pengatur Tumbuh (ZPT) bahan aktif Etefon khusus induksi pembungaan (forcing) nanas PG1.",
  },
  {
    idMaterial: "MAT-006",
    kodeMaterial: "BBM-SOL-01",
    namaMaterial: "Solar Industri (B35 High Quality)",
    kategori: "BBM & Pelumas",
    uom: "Liter",
    hargaAcuan: 14500,
    hargaRealisasi: 13800,
    deviasiPercent: -4.83,
    statusFluktuasi: "turun",
    tglUpdate: "05 Okt 2026",
    vendorUtama: "PT Pertamina Patra Niaga",
    spesifikasi: "Bahan bakar mesin diesel untuk traktor olah tanah (land prep), genset irigasi, dan armada pengangkut harvest.",
  },
  {
    idMaterial: "MAT-007",
    kodeMaterial: "BBM-OLI-01",
    namaMaterial: "Oli Mesin Heavy Duty SAE 15W-40",
    kategori: "BBM & Pelumas",
    uom: "Drum (200L)",
    hargaAcuan: 7200000,
    hargaRealisasi: 7200000,
    deviasiPercent: 0.0,
    statusFluktuasi: "stabil",
    tglUpdate: "25 Sep 2026",
    vendorUtama: "PT Shell Indonesia",
    spesifikasi: "Pelumas mesin diesel beban berat armada traktor John Deere & New Holland pool armada PG1.",
  },
  {
    idMaterial: "MAT-008",
    kodeMaterial: "BIB-SCK-01",
    namaMaterial: "Bibit Nanas Crown / Sucker Grade A",
    kategori: "Bibit & Tanaman",
    uom: "Batang",
    hargaAcuan: 450,
    hargaRealisasi: 420,
    deviasiPercent: -6.67,
    statusFluktuasi: "turun",
    tglUpdate: "01 Okt 2026",
    vendorUtama: "Nursery Internal PG1",
    spesifikasi: "Bibit vegetatif mahkota/sucker kualitas Grade A siap tanam untuk blok perluasan / sulam ratoon.",
  },
  {
    idMaterial: "MAT-009",
    kodeMaterial: "BIB-SLM-01",
    namaMaterial: "Bibit Penyulaman Sehat NSSC",
    kategori: "Bibit & Tanaman",
    uom: "Batang",
    hargaAcuan: 380,
    hargaRealisasi: 380,
    deviasiPercent: 0.0,
    statusFluktuasi: "stabil",
    tglUpdate: "30 Sep 2026",
    vendorUtama: "Nursery Internal PG1",
    spesifikasi: "Bibit penyulaman ratoon berumur 2-3 bulan sehat bebas penyakit mealybug wilt.",
  },
  {
    idMaterial: "MAT-010",
    kodeMaterial: "PRT-TRK-01",
    namaMaterial: "Pisau Chopper Land Prep Traktor",
    kategori: "Sparepart & Peralatan",
    uom: "Pcs",
    hargaAcuan: 220000,
    hargaRealisasi: 245000,
    deviasiPercent: 11.36,
    statusFluktuasi: "naik",
    tglUpdate: "27 Sep 2026",
    vendorUtama: "PT United Tractors / Impor",
    spesifikasi: "Sparepart mata pisau chopper pemotong mulsa dan tunggul pasca selesai bongkar tanaman lama.",
  },
  {
    idMaterial: "MAT-011",
    kodeMaterial: "PRT-PIP-01",
    namaMaterial: "Pipa Irigasi HDPE 4 Inch PN10",
    kategori: "Sparepart & Peralatan",
    uom: "Batang (6m)",
    hargaAcuan: 310000,
    hargaRealisasi: 295000,
    deviasiPercent: -4.84,
    statusFluktuasi: "turun",
    tglUpdate: "02 Okt 2026",
    vendorUtama: "PT Wavin / Rucika",
    spesifikasi: "Pipa jaringan irigasi sekunder tahan tekanan PN10 untuk suplesi air springkle musim kemarau.",
  },
  {
    idMaterial: "MAT-012",
    kodeMaterial: "PUP-ZA-01",
    namaMaterial: "Pupuk ZA (Ammonium Sulfat)",
    kategori: "Pupuk & Nutrisi",
    uom: "Zak (50Kg)",
    hargaAcuan: 290000,
    hargaRealisasi: 290000,
    deviasiPercent: 0.0,
    statusFluktuasi: "stabil",
    tglUpdate: "03 Okt 2026",
    vendorUtama: "PT Petrokimia Gresik",
    spesifikasi: "Sumber Nitrogen dan Sulfur penyubur tanah asam di wilayah perkebunan PG1.",
  },
];

export default function DashboardHargaMaterialPage() {
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState<MaterialFilterState>({
    kategori: "all",
    statusFluktuasi: "all",
    searchQuery: "",
  });

  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string | null>("PUP-NPK-01");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(INITIAL_MATERIALS.map((m) => m.kategori)));
  }, []);

  const handleFilterChange = (newFilters: Partial<MaterialFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      kategori: "all",
      statusFluktuasi: "all",
      searchQuery: "",
    });
  };

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return INITIAL_MATERIALS.filter((item) => {
      if (filters.kategori !== "all" && item.kategori !== filters.kategori) {
        return false;
      }
      if (filters.statusFluktuasi !== "all" && item.statusFluktuasi !== filters.statusFluktuasi) {
        return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = item.namaMaterial.toLowerCase().includes(q);
        const matchCode = item.kodeMaterial.toLowerCase().includes(q);
        const matchVendor = item.vendorUtama.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchVendor) return false;
      }
      return true;
    });
  }, [filters]);

  // Selected Material Object
  const selectedMaterial = useMemo(() => {
    return INITIAL_MATERIALS.find((m) => m.kodeMaterial === selectedMaterialCode) || null;
  }, [selectedMaterialCode]);

  // Summary Metrics
  const totalItems = filteredMaterials.length;
  const avgChange = useMemo(() => {
    if (filteredMaterials.length === 0) return 0;
    const sum = filteredMaterials.reduce((acc, curr) => acc + curr.deviasiPercent, 0);
    return sum / filteredMaterials.length;
  }, [filteredMaterials]);

  const highestRise = useMemo(() => {
    if (filteredMaterials.length === 0) return null;
    const sorted = [...filteredMaterials].sort((a, b) => b.deviasiPercent - a.deviasiPercent);
    if (sorted[0].deviasiPercent > 0) {
      return {
        name: sorted[0].namaMaterial,
        percent: sorted[0].deviasiPercent,
        priceDiff: sorted[0].hargaRealisasi - sorted[0].hargaAcuan,
      };
    }
    return null;
  }, [filteredMaterials]);

  const highestDrop = useMemo(() => {
    if (filteredMaterials.length === 0) return null;
    const sorted = [...filteredMaterials].sort((a, b) => a.deviasiPercent - b.deviasiPercent);
    if (sorted[0].deviasiPercent < 0) {
      return {
        name: sorted[0].namaMaterial,
        percent: sorted[0].deviasiPercent,
        priceDiff: sorted[0].hargaRealisasi - sorted[0].hargaAcuan,
      };
    }
    return null;
  }, [filteredMaterials]);

  // Category Trend Data for Chart
  const categoryTrends = useMemo<CategoryTrend[]>(() => {
    const map: Record<string, { totalBudget: number; totalReal: number; count: number }> = {};
    INITIAL_MATERIALS.forEach((m) => {
      if (!map[m.kategori]) {
        map[m.kategori] = { totalBudget: 0, totalReal: 0, count: 0 };
      }
      map[m.kategori].totalBudget += m.hargaAcuan;
      map[m.kategori].totalReal += m.hargaRealisasi;
      map[m.kategori].count += 1;
    });

    return Object.entries(map).map(([cat, val]) => {
      const avgBudget = val.totalBudget / val.count;
      const avgReal = val.totalReal / val.count;
      const dev = avgBudget > 0 ? ((avgReal - avgBudget) / avgBudget) * 100 : 0;
      return {
        category: cat,
        avgBudgetPrice: avgBudget,
        avgRealPrice: avgReal,
        variancePercent: dev,
        itemCount: val.count,
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white" suppressHydrationWarning>
      
      {/* 1. Header Navigation Bar (Identical to WIP & HPP Standards) */}
      <HargaMaterialDashboardHeader />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6" suppressHydrationWarning>
        
        {/* Section 1: Summary KPI Cards */}
        <section suppressHydrationWarning>
          <MaterialSummaryCards
            totalItems={totalItems}
            avgChange={avgChange}
            highestRise={highestRise}
            highestDrop={highestDrop}
          />
        </section>

        {/* Section 2: Main Filter Toolbar */}
        <section suppressHydrationWarning>
          <MaterialFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            categories={categories}
          />
        </section>

        {/* Section 3: Category Trend Comparison Chart */}
        <section suppressHydrationWarning>
          <MaterialTrendChart
            data={categoryTrends}
            onSelectCategory={(cat) => handleFilterChange({ kategori: cat })}
          />
        </section>

        {/* Section 4: Master Table (Max 20 baris per halaman) */}
        <section suppressHydrationWarning>
          <MaterialTable
            data={filteredMaterials}
            selectedMaterialCode={selectedMaterialCode}
            onSelectMaterial={(item) => setSelectedMaterialCode(item.kodeMaterial)}
          />
        </section>

        {/* Section 5: Detail Drilldown Card */}
        {selectedMaterial && (
          <section className="animate-in fade-in duration-300" suppressHydrationWarning>
            <MaterialDetailCard material={selectedMaterial} />
          </section>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 px-4 text-center text-xs text-[#5F6B63] mt-12" suppressHydrationWarning>
        <div className="max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Dashboard Harga Material • Master Data Logistik &amp; Fluktuasi PG 1
          </span>
        </div>
      </footer>
    </div>
  );
}
