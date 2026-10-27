import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toGenericCostCenter } from "@/lib/filters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = (searchParams.get("table") || searchParams.get("category") || "summary").toLowerCase().trim();
    const summaryMode = (searchParams.get("summary_mode") || "both").toLowerCase().trim();
    const pgParam = searchParams.get("pg")?.trim() || "ALL";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;
    let maxActualPeriod: number | undefined;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PREVIEW SUMMARY (DENGAN 3 PILIHAN MODE AGREGASI)
    // ─────────────────────────────────────────────────────────────────────────
    if (table === "summary") {
      // Hanya tampilkan Cost Center dan Cost Element yang berstatus isview: true
      const whereSummary = {
        costcenterRef: { isview: true },
        ce2Ref: { isview: true },
        ...(pgParam && pgParam !== "ALL" ? { pg: pgParam } : {}),
      };

      const allSummary = await prisma.summary.findMany({
        where: whereSummary,
        orderBy: [{ costcenter: "asc" }, { ce2: "asc" }, { periode: "asc" }],
      });

      // Cari periode data aktual terakhir yang ada (misal: Bln 1..3)
      const actualPeriods = allSummary
        .filter((s) => s.nilaiActual && Number(s.nilaiActual) > 0)
        .map((s) => s.periode);
      maxActualPeriod = actualPeriods.length > 0 ? Math.max(...actualPeriods) : 12;

      const q = search.toLowerCase();

      // Mode A: Per Cost Center Saja
      if (summaryMode === "cc") {
        const ccMap = new Map<
          string,
          {
            costcenter: string;
            deskripsiCostcenter: string;
            months: Record<number, { actual: number; budget: number }>;
          }
        >();

        for (const s of allSummary) {
          const cc = s.costcenter || "UNKNOWN";
          const desc = s.deskripsiCostcenter || cc;

          if (q && !cc.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) {
            continue;
          }

          if (!ccMap.has(cc)) {
            const months: Record<number, { actual: number; budget: number }> = {};
            for (let m = 1; m <= 12; m++) months[m] = { actual: 0, budget: 0 };
            ccMap.set(cc, {
              costcenter: cc,
              deskripsiCostcenter: desc,
              months,
            });
          }

          const cur = ccMap.get(cc)!;
          const act = s.nilaiActual ? Number(s.nilaiActual) : 0;
          const bgt = s.nilaiBudget ? Number(s.nilaiBudget) : 0;
          if (cur.months[s.periode]) {
            cur.months[s.periode].actual += act;
            cur.months[s.periode].budget += bgt;
          }
        }

        const rows = Array.from(ccMap.values()).map((r) => {
          let totalActual = 0;
          let totalBudget = 0;
          for (let m = 1; m <= 12; m++) {
            totalActual += r.months[m].actual;
            // YTD Budget hanya dijumlahkan sampai periode data actual terakhir yang tersedia
            if (m <= maxActualPeriod!) {
              totalBudget += r.months[m].budget;
            }
          }
          const variance =
            totalBudget > 0
              ? Number((((totalActual - totalBudget) / totalBudget) * 100).toFixed(2))
              : null;

          return {
            ...r,
            totalActual,
            totalBudget,
            variance,
          };
        });

        total = rows.length;
        data = rows.slice(skip, skip + limit);
      }
      // Mode B: Per Cost Element (CE2) Saja
      else if (summaryMode === "ce2") {
        const ceMap = new Map<
          string,
          {
            ce2: string;
            deskripsiCe2: string;
            months: Record<number, { actual: number; budget: number }>;
          }
        >();

        for (const s of allSummary) {
          const ce = s.ce2 || "UNKNOWN";
          const desc = s.deskripsiCe2 || ce;

          if (q && !ce.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) {
            continue;
          }

          if (!ceMap.has(ce)) {
            const months: Record<number, { actual: number; budget: number }> = {};
            for (let m = 1; m <= 12; m++) months[m] = { actual: 0, budget: 0 };
            ceMap.set(ce, {
              ce2: ce,
              deskripsiCe2: desc,
              months,
            });
          }

          const cur = ceMap.get(ce)!;
          const act = s.nilaiActual ? Number(s.nilaiActual) : 0;
          const bgt = s.nilaiBudget ? Number(s.nilaiBudget) : 0;
          if (cur.months[s.periode]) {
            cur.months[s.periode].actual += act;
            cur.months[s.periode].budget += bgt;
          }
        }

        const rows = Array.from(ceMap.values()).map((r) => {
          let totalActual = 0;
          let totalBudget = 0;
          for (let m = 1; m <= 12; m++) {
            totalActual += r.months[m].actual;
            // YTD Budget hanya dijumlahkan sampai periode data actual terakhir yang tersedia
            if (m <= maxActualPeriod!) {
              totalBudget += r.months[m].budget;
            }
          }
          const variance =
            totalBudget > 0
              ? Number((((totalActual - totalBudget) / totalBudget) * 100).toFixed(2))
              : null;

          return {
            ...r,
            totalActual,
            totalBudget,
            variance,
          };
        });

        total = rows.length;
        data = rows.slice(skip, skip + limit);
      }
      // Mode C: Per Cost Center & Cost Element (Both)
      else {
        const comboMap = new Map<
          string,
          {
            pg: string;
            costcenter: string;
            deskripsiCostcenter: string;
            ce2: string;
            deskripsiCe2: string;
            months: Record<number, { actual: number; budget: number }>;
          }
        >();

        for (const s of allSummary) {
          const cc = s.costcenter || "UNKNOWN";
          const ccDesc = s.deskripsiCostcenter || cc;
          const ce = s.ce2 || "UNKNOWN";
          const ceDesc = s.deskripsiCe2 || ce;
          const pg = s.pg || "-";
          const key = `${cc}|${ce}|${pg}`;

          if (
            q &&
            !cc.toLowerCase().includes(q) &&
            !ccDesc.toLowerCase().includes(q) &&
            !ce.toLowerCase().includes(q) &&
            !ceDesc.toLowerCase().includes(q) &&
            !pg.toLowerCase().includes(q)
          ) {
            continue;
          }

          if (!comboMap.has(key)) {
            const months: Record<number, { actual: number; budget: number }> = {};
            for (let m = 1; m <= 12; m++) months[m] = { actual: 0, budget: 0 };
            comboMap.set(key, {
              pg,
              costcenter: cc,
              deskripsiCostcenter: ccDesc,
              ce2: ce,
              deskripsiCe2: ceDesc,
              months,
            });
          }

          const cur = comboMap.get(key)!;
          const act = s.nilaiActual ? Number(s.nilaiActual) : 0;
          const bgt = s.nilaiBudget ? Number(s.nilaiBudget) : 0;
          if (cur.months[s.periode]) {
            cur.months[s.periode].actual += act;
            cur.months[s.periode].budget += bgt;
          }
        }

        const rows = Array.from(comboMap.values()).map((r) => {
          let totalActual = 0;
          let totalBudget = 0;
          for (let m = 1; m <= 12; m++) {
            totalActual += r.months[m].actual;
            // YTD Budget hanya dijumlahkan sampai periode data actual terakhir yang tersedia
            if (m <= maxActualPeriod!) {
              totalBudget += r.months[m].budget;
            }
          }
          const variance =
            totalBudget > 0
              ? Number((((totalActual - totalBudget) / totalBudget) * 100).toFixed(2))
              : null;

          return {
            ...r,
            totalActual,
            totalBudget,
            variance,
          };
        });

        total = rows.length;
        data = rows.slice(skip, skip + limit);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DATA ACTUAL (SEMUA KOLOM KECUALI ID & KODE)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "actual" || table === "data_actual") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { costControl: { contains: search, mode: "insensitive" as const } },
              { costDescription: { contains: search, mode: "insensitive" as const } },
              { notes: { contains: search, mode: "insensitive" as const } },
              { pg: { contains: search, mode: "insensitive" as const } },
              { documentNumber: { contains: search, mode: "insensitive" as const } },
              { groupingDepartement: { contains: search, mode: "insensitive" as const } },
              { subgrup: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.dataActual.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ period: "asc" }, { costcenter: "asc" }, { idActual: "asc" }],
        }),
        prisma.dataActual.count({ where }),
      ]);

      // Tanpa idActual dan kode
      data = records.map((r) => ({
        period: r.period,
        pg: r.pg,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        costControl: r.costControl,
        costDescription: r.costDescription,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        notes: r.notes,
        idrAct: r.idrAct ? Number(r.idrAct) : 0,
        usdAct: r.usdAct ? Number(r.usdAct) : 0,
        objectCurrency: r.objectCurrency || "IDR",
        totalQuantity: r.totalQuantity ? Number(r.totalQuantity) : 0,
        postedUnitOfMeas: r.postedUnitOfMeas,
        documentNumber: r.documentNumber,
        documentDate: r.documentDate ? r.documentDate.toISOString().split("T")[0] : null,
        postingDate: r.postingDate ? r.postingDate.toISOString().split("T")[0] : null,
        groupingDepartement: r.groupingDepartement,
        subgrup: r.subgrup,
        grupExp: r.grupExp,
        jenisBiaya: r.jenisBiaya,
        ceGrup: r.ceGrup,
        grupAktivitas: r.grupAktivitas,
        mappingBiaya: r.mappingBiaya,
      }));
      total = count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. DATA BUDGET (SEMUA KOLOM KECUALI ID & KODE)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "budget" || table === "data_budget") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { bbp: { contains: search, mode: "insensitive" as const } },
              { groupExp: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.dataBudget.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ period: "asc" }, { costcenter: "asc" }, { idBudget: "asc" }],
        }),
        prisma.dataBudget.count({ where }),
      ]);

      // Tanpa idBudget dan kode
      data = records.map((r) => ({
        period: r.period,
        month: r.month ? r.month.toISOString().split("T")[0] : null,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        amountIdr: r.amountIdr ? Number(r.amountIdr) : 0,
        amountUsd: r.amountUsd ? Number(r.amountUsd) : 0,
        bbp: r.bbp,
        groupExp: r.groupExp,
      }));
      total = count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. MASTERSHEET COST CENTER (SOLUSI C: PENGATURAN BERBASIS FUNGSI GENERIK)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "master_cc" || table === "costcenter") {
      const allCc = await prisma.mastersheetCostcenter.findMany({
        orderBy: { costcenter: "asc" },
      });

      // Kelompokkan 77 Cost Center menjadi 28 Kelompok Fungsi Generik (Solusi C)
      const groupMap = new Map<
        string,
        {
          costcenter: string;
          deskripsiCostcenter: string;
          units: string[];
          isview: boolean;
          codes: string[];
          updatedAt: string | null;
        }
      >();

      for (const c of allCc) {
        const { genericCode, genericDesc } = toGenericCostCenter(c.costcenter, c.deskripsiCostcenter);

        let unit = "PG1";
        if (
          c.costcenter.includes("PG2") ||
          c.costcenter.includes("SS2") ||
          c.costcenter.startsWith("10PPG2") ||
          c.costcenter.startsWith("10PSS2")
        ) {
          unit = "PG2";
        } else if (
          c.costcenter.includes("PG3") ||
          c.costcenter.includes("SS3") ||
          c.costcenter.startsWith("10PPG3") ||
          c.costcenter.startsWith("10PSS3")
        ) {
          unit = "PG3";
        }

        if (!groupMap.has(genericCode)) {
          groupMap.set(genericCode, {
            costcenter: genericCode,
            deskripsiCostcenter: genericDesc,
            units: [unit],
            isview: c.isview,
            codes: [c.costcenter],
            updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
          });
        } else {
          const g = groupMap.get(genericCode)!;
          if (!g.units.includes(unit)) g.units.push(unit);
          g.codes.push(c.costcenter);
          // Jika salah satu unit aktif, switch fungsi generik aktif
          if (c.isview) g.isview = true;
        }
      }

      let groups = Array.from(groupMap.values()).map((g) => ({
        costcenter: g.costcenter,
        deskripsiCostcenter: g.deskripsiCostcenter,
        units: g.units.sort().join(", "),
        codes: g.codes,
        isview: g.isview,
        updatedAt: g.updatedAt,
      }));

      if (search) {
        const q = search.toLowerCase();
        groups = groups.filter(
          (g) =>
            g.costcenter.toLowerCase().includes(q) ||
            g.deskripsiCostcenter.toLowerCase().includes(q) ||
            g.units.toLowerCase().includes(q)
        );
      }

      total = groups.length;
      data = groups.slice(skip, skip + limit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. MASTERSHEET COST ELEMENT CE2 (DENGAN STATUS VISIBILITAS)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "master_ce2" || table === "ce2") {
      const where = search
        ? {
            OR: [
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.mastersheetCe2.findMany({
          where,
          skip,
          take: limit,
          orderBy: { ce2: "asc" },
        }),
        prisma.mastersheetCe2.count({ where }),
      ]);

      data = records.map((e) => ({
        ce2: e.ce2,
        deskripsiCe2: e.deskripsiCe2,
        isview: e.isview,
        createdAt: e.createdAt ? e.createdAt.toISOString() : null,
        updatedAt: e.updatedAt ? e.updatedAt.toISOString() : null,
      }));
      total = count;
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
      ...(maxActualPeriod !== undefined ? { maxActualPeriod } : {}),
    });
  } catch (error) {
    console.error("Error in admin preview API:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data preview." }, { status: 500 });
  }
}

/**
 * PATCH handler untuk toggle status 'isview' pada master costcenter atau master ce2
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, isview } = body;

    if (!type || !id || typeof isview !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Parameter 'type', 'id', dan 'isview' wajib diisi." },
        { status: 400 }
      );
    }

    // A. Bulk update: Tampilkan Semua / Sembunyikan Semua
    if (id === "all" || body.all === true) {
      if (type === "cc" || type === "costcenter") {
        const result = await prisma.mastersheetCostcenter.updateMany({
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Seluruh Cost Center (${result.count} data) berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        });
      } else if (type === "ce2" || type === "costelement") {
        const result = await prisma.mastersheetCe2.updateMany({
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Seluruh Cost Element CE2 (${result.count} data) berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        });
      } else {
        return NextResponse.json({ success: false, message: "Tipe master tidak valid." }, { status: 400 });
      }
    }

    // B. Single update per record (atau per Kelompok Fungsi Generik)
    if (type === "cc" || type === "costcenter") {
      if (id.startsWith("10PPGx") || id.startsWith("10PSSx")) {
        const prefix = id.substring(0, 5); // 10PPG atau 10PSS
        const suffix = id.substring(6);    // e.g. CO99
        const targets = [`${prefix}1${suffix}`, `${prefix}2${suffix}`, `${prefix}3${suffix}`, id];
        const updated = await prisma.mastersheetCostcenter.updateMany({
          where: { costcenter: { in: targets } },
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Fungsi Cost Center ${id} (${updated.count} unit PG) berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        });
      } else {
        const updated = await prisma.mastersheetCostcenter.update({
          where: { costcenter: id },
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Cost Center ${id} berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
          item: updated,
        });
      }
    } else if (type === "ce2" || type === "costelement") {
      const updated = await prisma.mastersheetCe2.update({
        where: { ce2: id },
        data: { isview },
      });
      return NextResponse.json({
        success: true,
        message: `Cost Element ${id} berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        item: updated,
      });
    } else {
      return NextResponse.json({ success: false, message: "Tipe master tidak valid." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating isview status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status visibilitas master data." },
      { status: 500 }
    );
  }
}
