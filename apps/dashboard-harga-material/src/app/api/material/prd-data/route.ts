import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paramGroup = searchParams.get("group") || "";
    const selectedMaterial = searchParams.get("material") || "";
    const paramYear = searchParams.get("year") || "";

    // 1. Fetch all distinct groups strictly from MasterSheet table for the Group Filter
    const allMastersheetsRaw = await prisma.masterSheet.findMany({
      select: { group: true },
    });

    const groupsList = Array.from(
      new Set(
        allMastersheetsRaw
          .map((g) => (g.group || "").trim())
          .filter((g) => g !== "" && g !== "-")
      )
    ).sort((a, b) => a.localeCompare(b));

    // Determine active group: paramGroup if valid in groupsList, else default to first group
    let activeGroupCode = paramGroup;
    if (!activeGroupCode || activeGroupCode === "ALL" || !groupsList.includes(activeGroupCode)) {
      activeGroupCode = groupsList.length > 0 ? groupsList[0] : "";
    }

    // 2. Fetch master materials dependent on activeGroupCode
    const masterWhere: any = {};
    if (activeGroupCode === "-") {
      masterWhere.OR = [
        { group: null },
        { group: "" },
        { group: { equals: "-", mode: "insensitive" } },
      ];
    } else if (activeGroupCode) {
      masterWhere.group = { equals: activeGroupCode, mode: "insensitive" };
    }

    const mastersheets = await prisma.masterSheet.findMany({
      where: masterWhere,
      orderBy: { material: "asc" },
    });

    const materialsList = mastersheets.map((m) => ({
      material: m.material,
      materialDescription: m.materialDescription,
      group: (m.group || "").trim() || "-",
      baseUnitOfMeasure: m.baseUnitOfMeasure,
      abcIndicator: m.abcIndicator,
    }));

    // Determine active material: selectedMaterial if valid in filtered materials, else fallback to first material
    let activeMaterialCode = selectedMaterial;
    if (!activeMaterialCode || !materialsList.some((m) => m.material === activeMaterialCode)) {
      activeMaterialCode = materialsList.length > 0 ? materialsList[0].material : "";
    }

    const activeMaster = materialsList.find((m) => m.material === activeMaterialCode) || null;

    // 3. Fetch all bahan_material for analysis
    const allBahanRecords = await prisma.bahanMaterial.findMany({
      orderBy: { update: "asc" },
    });

    // Extract available distinct years from bahanMaterial
    const yearsList = Array.from(
      new Set(
        allBahanRecords
          .map((b) => (b.update ? new Date(b.update).getFullYear().toString() : null))
          .filter((y): y is string => Boolean(y))
      )
    ).sort((a, b) => b.localeCompare(a));

    if (yearsList.length === 0) {
      yearsList.push(new Date().getFullYear().toString());
    }

    let activeYear = paramYear;
    if (!activeYear || !yearsList.includes(activeYear)) {
      activeYear = yearsList[0];
    }

    const selectedYearNum = parseInt(activeYear, 10);
    const bahanRecordsForYear = allBahanRecords.filter((b) => {
      if (!b.update) return false;
      return new Date(b.update).getFullYear() === selectedYearNum;
    });

    // Process Card 1 (Selected Material Bar Chart & Summary Info for Active Year)
    const chartMonthlyData: { month: number; label: string; nilai: number | null; date: string | null }[] = Array.from(
      { length: 12 },
      (_, i) => ({
        month: i + 1,
        label: `Bln ${i + 1}`,
        nilai: null,
        date: null,
      })
    );

    let latestUpdateInfo: { update: Date | null; nilai: number | null } = {
      update: null,
      nilai: null,
    };

    if (activeMaterialCode) {
      // Filter bahan records for active material & selected year
      const activeBahan = bahanRecordsForYear.filter((b) => b.material === activeMaterialCode);

      // Track MAX(update) for each month (1..12) per Section 8 & 13 of PRD
      const monthLatestMap = new Map<number, { updateTime: number; nilai: number }>();

      activeBahan.forEach((record) => {
        if (record.update && record.nilai !== null) {
          const updateDate = new Date(record.update);
          const monthNum = updateDate.getMonth() + 1; // 1-12
          const updateTime = updateDate.getTime();
          const currentNilai = Number(record.nilai);

          // Update MAX(update) for monthly chart
          if (!monthLatestMap.has(monthNum) || updateTime > monthLatestMap.get(monthNum)!.updateTime) {
            monthLatestMap.set(monthNum, { updateTime, nilai: currentNilai });
          }

          // Update overall MAX(update) for Nilai Terbaru
          if (!latestUpdateInfo.update || updateTime > latestUpdateInfo.update.getTime()) {
            latestUpdateInfo = { update: updateDate, nilai: currentNilai };
          }
        }
      });

      // Populate chartMonthlyData
      for (let m = 1; m <= 12; m++) {
        if (monthLatestMap.has(m)) {
          const entry = monthLatestMap.get(m)!;
          chartMonthlyData[m - 1].nilai = entry.nilai;
          chartMonthlyData[m - 1].date = new Date(entry.updateTime).toISOString();
        }
      }
    }

    // 4. Process Card 2 (Pivoted Detail Table for All Mastersheets filtered by Selected Year)
    const pivotedTableRows = mastersheets.map((m) => {
      const matBahan = bahanRecordsForYear.filter((b) => b.material === m.material);
      const monthlyValues: (number | null)[] = Array(12).fill(null);

      const monthMap = new Map<number, { updateTime: number; nilai: number }>();

      matBahan.forEach((record) => {
        if (record.update && record.nilai !== null) {
          const updateDate = new Date(record.update);
          const monthNum = updateDate.getMonth() + 1;
          const updateTime = updateDate.getTime();
          const numNilai = Number(record.nilai);

          if (!monthMap.has(monthNum) || updateTime > monthMap.get(monthNum)!.updateTime) {
            monthMap.set(monthNum, { updateTime, nilai: numNilai });
          }
        }
      });

      for (let m = 1; m <= 12; m++) {
        if (monthMap.has(m)) {
          monthlyValues[m - 1] = monthMap.get(m)!.nilai;
        }
      }

      return {
        material: m.material,
        materialDescription: m.materialDescription || "-",
        group: (m.group || "").trim() || "-",
        baseUnitOfMeasure: m.baseUnitOfMeasure || "-",
        abcIndicator: m.abcIndicator || "-",
        months: monthlyValues,
      };
    });

    return NextResponse.json({
      success: true,
      groups: groupsList,
      activeGroupCode,
      materials: materialsList,
      activeMaterialCode,
      years: yearsList,
      activeYear,
      card1: {
        activeMaster,
        chart: chartMonthlyData,
        latestNilai: latestUpdateInfo.nilai,
        latestUpdateDate: latestUpdateInfo.update ? latestUpdateInfo.update.toISOString() : null,
      },
      card2: {
        tableRows: pivotedTableRows,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch PRD dashboard data" },
      { status: 500 }
    );
  }
}
