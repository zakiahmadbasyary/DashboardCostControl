import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PG1_REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Ambil tahun-tahun yang tersedia
    const distinctYears = await prisma.summarySulam.findMany({
      where: { pg: "PG1" },
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });

    const availableYears = distinctYears.map((y) => y.year);
    const defaultYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();
    const selectedYear = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : defaultYear;

    // Bulan-bulan yang memiliki data di tahun terpilih (khusus PG1)
    const distinctMonths = await prisma.summarySulam.findMany({
      where: { pg: "PG1", year: selectedYear },
      select: { month: true },
      distinct: ["month"],
      orderBy: { month: "desc" },
    });
    const monthsWithData = distinctMonths.map((m) => m.month);
    const defaultMonth = monthsWithData.length > 0 ? monthsWithData[0] : 1;
    const selectedMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : defaultMonth;

    // =========================================================================
    // BAGIAN 1: Perbandingan Bulanan Antar Wilayah (Selalu 12 Bulan, AW01-AW07)
    // Sumber: summary_sulam
    // =========================================================================
    const rawSummaries = await prisma.summarySulam.findMany({
      where: {
        pg: "PG1",
        year: selectedYear,
        wilayah: { in: PG1_REGIONS },
      },
    });

    // Struktur per wilayah (AW01..AW07) x per bulan (1..12)
    type RegionMonthAgg = {
      jumlahTk: number;
      batang: number;
      hasData: boolean;
    };

    const matrixMap: Record<string, Record<number, RegionMonthAgg>> = {};
    for (const w of PG1_REGIONS) {
      matrixMap[w] = {};
      for (let m = 1; m <= 12; m++) {
        matrixMap[w][m] = { jumlahTk: 0, batang: 0, hasData: false };
      }
    }

    for (const row of rawSummaries) {
      const w = row.wilayah;
      const m = row.month;
      if (matrixMap[w] && matrixMap[w][m]) {
        matrixMap[w][m].jumlahTk += Number(row.jumlahTk);
        matrixMap[w][m].batang += Number(row.batang);
        matrixMap[w][m].hasData = true;
      }
    }

    // Buat data tabel matriks dan data grafik untuk TK & Kapasitas Batang/TK
    const tkMatrixRows: any[] = [];
    const batangTkMatrixRows: any[] = [];

    const tkChartData: any[] = [];
    const batangTkChartData: any[] = [];

    for (let m = 1; m <= 12; m++) {
      const tkObj: any = { month: m, monthName: MONTH_NAMES_SHORT[m - 1], monthFull: MONTH_NAMES_FULL[m - 1] };
      const btkObj: any = { month: m, monthName: MONTH_NAMES_SHORT[m - 1], monthFull: MONTH_NAMES_FULL[m - 1] };

      for (const w of PG1_REGIONS) {
        const item = matrixMap[w][m];
        tkObj[w] = item.hasData ? item.jumlahTk : 0;
        btkObj[w] = item.hasData && item.jumlahTk > 0 ? Number((item.batang / item.jumlahTk).toFixed(1)) : null;
      }

      tkChartData.push(tkObj);
      batangTkChartData.push(btkObj);
    }

    for (const w of PG1_REGIONS) {
      const tkMonths: (number | null)[] = [];
      const btkMonths: (number | null)[] = [];
      let totTk = 0;
      let totBatang = 0;
      let hasDataAny = false;

      for (let m = 1; m <= 12; m++) {
        const item = matrixMap[w][m];
        if (item.hasData) {
          hasDataAny = true;
          totTk += item.jumlahTk;
          totBatang += item.batang;
          tkMonths.push(item.jumlahTk);
          btkMonths.push(item.jumlahTk > 0 ? Number((item.batang / item.jumlahTk).toFixed(1)) : null);
        } else {
          tkMonths.push(0);
          btkMonths.push(null);
        }
      }

      tkMatrixRows.push({
        wilayah: w,
        months: tkMonths,
        total: totTk,
        hasData: hasDataAny,
      });

      batangTkMatrixRows.push({
        wilayah: w,
        months: btkMonths,
        total: totTk > 0 ? Number((totBatang / totTk).toFixed(1)) : null,
        hasData: hasDataAny,
      });
    }

    // =========================================================================
    // BAGIAN 2: Analisis 4 Indikator per Wilayah pada Bulan Terpilih (AW01-AW07)
    // Sumber: sulam
    // =========================================================================
    const rawTransactions = await prisma.sulam.findMany({
      where: {
        pg: "PG1",
        year: selectedYear,
        month: selectedMonth,
        wilayah: { in: PG1_REGIONS },
      },
      select: {
        wilayah: true,
        lokasi: true,
        jenis: true,
        totalRealisasiBiaya: true,
        resourceBahanAlat: true,
        hasilEfektif: true,
      },
    });

    type RegionDetailAgg = {
      costTotal: number;
      luasUpah: number;
      luasTotal: number;
      tk: number;
      batang: number;
      hasData: boolean;
    };

    const regionDetailMap: Record<string, RegionDetailAgg> = {};
    for (const w of PG1_REGIONS) {
      regionDetailMap[w] = { costTotal: 0, luasUpah: 0, luasTotal: 0, tk: 0, batang: 0, hasData: false };
    }

    for (const tx of rawTransactions) {
      const w = tx.wilayah;
      if (regionDetailMap[w]) {
        regionDetailMap[w].hasData = true;
        const biaya = Number(tx.totalRealisasiBiaya) || 0;
        const resource = Number(tx.resourceBahanAlat) || 0;
        const luas = Number(tx.hasilEfektif) || 0;

        regionDetailMap[w].costTotal += biaya;
        regionDetailMap[w].luasTotal += luas;

        if (tx.jenis === "Upah") {
          regionDetailMap[w].tk += resource;
          regionDetailMap[w].luasUpah += luas;
        } else if (tx.jenis === "Material") {
          regionDetailMap[w].batang += resource;
        }
      }
    }

    // 4 Grafik Bagian 2
    const bagian2Charts = PG1_REGIONS.map((w) => {
      const agg = regionDetailMap[w];
      // Luas yang digunakan untuk Cost/HA: gunakan luasUpah jika > 0, fallback ke luasTotal
      const luasForCostHa = agg.luasUpah > 0 ? agg.luasUpah : agg.luasTotal;
      const costPerHaJuta = luasForCostHa > 0 ? (agg.costTotal / luasForCostHa) / 1000000 : null;

      return {
        wilayah: w,
        costTotal: agg.costTotal,
        costPerHaJuta: costPerHaJuta !== null ? Number(costPerHaJuta.toFixed(2)) : null,
        penggunaanTk: agg.tk,
        penggunaanBatang: agg.batang,
        luasHa: luasForCostHa,
        hasData: agg.hasData,
      };
    });

    // =========================================================================
    // BAGIAN 3: Tabel Detail Seluruh Lokasi pada Bulan Terpilih
    // Grain: wilayah + lokasi
    // =========================================================================
    type LocationAgg = {
      wilayah: string;
      lokasi: string;
      tk: number;
      batang: number;
      ha: number;
      hasData: boolean;
    };

    const locationMap = new Map<string, LocationAgg>();

    for (const tx of rawTransactions) {
      const w = tx.wilayah;
      const lok = (tx.lokasi || "-").trim();
      const key = `${w}__${lok}`;

      let item = locationMap.get(key);
      if (!item) {
        item = {
          wilayah: w,
          lokasi: lok,
          tk: 0,
          batang: 0,
          ha: 0,
          hasData: true,
        };
        locationMap.set(key, item);
      }

      const resource = Number(tx.resourceBahanAlat) || 0;
      const luas = Number(tx.hasilEfektif) || 0;

      if (tx.jenis === "Upah") {
        item.tk += resource;
        item.ha += luas;
      } else if (tx.jenis === "Material") {
        item.batang += resource;
        // Jika luas Upah belum terisi, tambahkan jika perlu
        if (item.ha === 0 && luas > 0) {
          item.ha += luas;
        }
      }
    }

    let locationList = Array.from(locationMap.values()).map((loc) => ({
      ...loc,
      batangTk: loc.tk > 0 ? Number((loc.batang / loc.tk).toFixed(1)) : null,
    }));

    // Filter pencarian lokasi
    const searchQuery = searchParams.get("search")?.toLowerCase().trim();
    if (searchQuery) {
      locationList = locationList.filter(
        (l) => l.lokasi.toLowerCase().includes(searchQuery) || l.wilayah.toLowerCase().includes(searchQuery)
      );
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "wilayah";
    const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;

    locationList.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return valA.localeCompare(valB) * sortDir;
      }
      return (valA - valB) * sortDir;
    });

    // Filter wilayah opsional
    const wilayahFilter = searchParams.get("wilayah");
    if (wilayahFilter && wilayahFilter !== "all" && wilayahFilter !== "Semua") {
      locationList = locationList.filter((l) => l.wilayah === wilayahFilter);
    }

    // Hitung Total Akumulasi Keseluruhan Lokasi
    let totalLocationTk = 0;
    let totalLocationBatang = 0;
    let totalLocationHa = 0;

    for (const loc of locationList) {
      totalLocationTk += loc.tk;
      totalLocationBatang += loc.batang;
      totalLocationHa += loc.ha;
    }

    const locationTotal = {
      tk: totalLocationTk,
      batang: totalLocationBatang,
      ha: totalLocationHa,
      batangTk: totalLocationTk > 0 ? Number((totalLocationBatang / totalLocationTk).toFixed(1)) : null,
    };

    // Pagination / Return All
    const isAll = searchParams.get("all") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(5, parseInt(searchParams.get("pageSize") || "15", 10));
    const totalItems = locationList.length;
    const totalPages = isAll ? 1 : Math.ceil(totalItems / pageSize) || 1;
    const paginatedLocations = isAll || pageSize >= 1000 ? locationList : locationList.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      success: true,
      selectedYear,
      selectedMonth,
      monthName: MONTH_NAMES_FULL[selectedMonth - 1],
      availableYears: availableYears.length > 0 ? availableYears : [selectedYear],
      monthsWithData,
      bagian1: {
        regions: PG1_REGIONS,
        tkChartData,
        tkMatrixRows,
        batangTkChartData,
        batangTkMatrixRows,
      },
      bagian2: {
        charts: bagian2Charts,
      },
      bagian3: {
        locations: paginatedLocations,
        totalCount: totalItems,
        page,
        pageSize,
        totalPages,
        locationTotal,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil data agregasi Antar Wilayah:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengagregasi data Antar Wilayah.", error: error.message },
      { status: 500 }
    );
  }
}

