import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BudgetStatus, Prisma, StatusCapex } from "@prisma/client";

// Safe serializer for BigInt and Decimal
function serializeData<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => {
      if (typeof v === "bigint") return v.toString();
      return v;
    })
  );
}

// Business Rule Helper for Eligibility (Internal helper, not exported to satisfy Next.js App Router route constraints)
function evaluateCapexCloseEligibility(item: {
  statusCapex: string | null;
  wbs?: string | null;
  mo?: string | null;
  io?: string | null;
  budgetType?: string | null;
  isManuallyClose?: boolean;
}) {
  const isClosed =
    item.isManuallyClose ||
    item.statusCapex === StatusCapex.Sudah_Close ||
    item.statusCapex === "Sudah Close";

  // Determine Type: WBS, MO, or IO
  let itemType: "WBS" | "MO" | "IO" = "IO";
  const wbsVal = (item.wbs || "").trim();
  const moVal = (item.mo || "").trim();
  const bType = (item.budgetType || "").toUpperCase();

  if (wbsVal || bType.includes("WBS")) {
    itemType = "WBS";
  } else if (moVal || bType.includes("MO")) {
    itemType = "MO";
  } else {
    itemType = "IO";
  }

  if (isClosed) {
    return {
      eligible: false,
      isClosed: true,
      reason: "Sudah dalam status Ditutup (Sudah Close)",
      itemType,
      closeCriteria: "Closed" as const,
    };
  }

  const isSudahPo =
    item.statusCapex === StatusCapex.Sudah_PO ||
    item.statusCapex === "Sudah PO";

  const isFinalApprove =
    item.statusCapex === StatusCapex.Final_Approve ||
    item.statusCapex === "Final Approve";

  // Kriteria 1: Ketika datanya sudah PO (bisa di-close untuk tipe apapun)
  if (isSudahPo) {
    return {
      eligible: true,
      isClosed: false,
      reason: "Sudah PO (Memenuhi syarat penutupan)",
      itemType,
      closeCriteria: "Sudah_PO" as const,
    };
  }

  // Kriteria 2: Ketika datanya bertipe WBS atau MO dan sudah Final Approve
  if ((itemType === "WBS" || itemType === "MO") && isFinalApprove) {
    return {
      eligible: true,
      isClosed: false,
      reason: `Tipe ${itemType} dengan status Final Approve (Memenuhi syarat penutupan)`,
      itemType,
      closeCriteria: "Final_Approve_WBS_MO" as const,
    };
  }

  // Ineligible: Tipe IO dengan Final Approve (harus tunggu PO)
  if (itemType === "IO" && isFinalApprove) {
    return {
      eligible: false,
      isClosed: false,
      reason: "Tipe IO harus berstatus Sudah PO untuk dapat ditutup",
      itemType,
      closeCriteria: "Ineligible" as const,
    };
  }

  // Ineligible lainnya (Sudah Created / Belum Created)
  return {
    eligible: false,
    isClosed: false,
    reason: `Status saat ini "${item.statusCapex || "Belum Created"}" belum memenuhi syarat penutupan`,
    itemType,
    closeCriteria: "Ineligible" as const,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim() || "all";
    const typeFilter = searchParams.get("type")?.trim() || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    // Base search where condition
    const searchConditions: Prisma.TotalWhereInput[] = [];
    if (search) {
      searchConditions.push({
        OR: [
          { capexNo: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { costCenter: { contains: search, mode: "insensitive" } },
          { io: { contains: search, mode: "insensitive" } },
          { mo: { contains: search, mode: "insensitive" } },
          { wbs: { contains: search, mode: "insensitive" } },
          { nomorPr: { contains: search, mode: "insensitive" } },
          { komoditi: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Fetch all records for the search keyword
    const allMatching = await prisma.total.findMany({
      where: searchConditions.length > 0 ? { AND: searchConditions } : {},
      orderBy: { idTotal: "desc" },
    });

    // Evaluate eligibility and enrich records
    const enriched = allMatching.map((item) => {
      const evalResult = evaluateCapexCloseEligibility(item);
      return {
        ...item,
        eligible: evalResult.eligible,
        isClosed: evalResult.isClosed,
        eligibilityReason: evalResult.reason,
        detectedType: evalResult.itemType,
        closeCriteria: evalResult.closeCriteria,
      };
    });

    // Compute overview stats (based on all matching search)
    const stats = {
      total: enriched.length,
      belumCreated: enriched.filter(
        (i) => i.statusCapex === StatusCapex.Belum_Created || (!i.statusCapex && !i.isClosed)
      ).length,
      sudahCreated: enriched.filter(
        (i) => i.statusCapex === StatusCapex.Sudah_Created
      ).length,
      finalApprove: enriched.filter(
        (i) => i.statusCapex === StatusCapex.Final_Approve
      ).length,
      sudahPo: enriched.filter(
        (i) => i.statusCapex === StatusCapex.Sudah_PO
      ).length,
      sudahClose: enriched.filter(
        (i) => i.isClosed || i.statusCapex === StatusCapex.Sudah_Close
      ).length,
      eligible: enriched.filter((i) => i.eligible).length,
      closed: enriched.filter((i) => i.isClosed).length,
      ineligible: enriched.filter((i) => !i.eligible && !i.isClosed).length,
    };

    // Filter by type
    let filtered = enriched;
    if (typeFilter === "wbs") {
      filtered = filtered.filter((i) => i.detectedType === "WBS");
    } else if (typeFilter === "mo") {
      filtered = filtered.filter((i) => i.detectedType === "MO");
    } else if (typeFilter === "io") {
      filtered = filtered.filter((i) => i.detectedType === "IO");
    }

    // Filter by exact status (Belum Created, Sudah Created, Final Approve, Sudah PO, Sudah Close)
    if (statusFilter === "Belum Created" || statusFilter === "Belum_Created") {
      filtered = filtered.filter(
        (i) => i.statusCapex === StatusCapex.Belum_Created || (!i.statusCapex && !i.isClosed)
      );
    } else if (statusFilter === "Sudah Created" || statusFilter === "Sudah_Created") {
      filtered = filtered.filter((i) => i.statusCapex === StatusCapex.Sudah_Created);
    } else if (statusFilter === "Final Approve" || statusFilter === "Final_Approve") {
      filtered = filtered.filter((i) => i.statusCapex === StatusCapex.Final_Approve);
    } else if (statusFilter === "Sudah PO" || statusFilter === "Sudah_PO" || statusFilter === "sudah_po") {
      filtered = filtered.filter((i) => i.statusCapex === StatusCapex.Sudah_PO);
    } else if (statusFilter === "Sudah Close" || statusFilter === "Sudah_Close" || statusFilter === "closed") {
      filtered = filtered.filter(
        (i) => i.statusCapex === StatusCapex.Sudah_Close || i.isClosed
      );
    } else if (statusFilter === "eligible") {
      filtered = filtered.filter((i) => i.eligible);
    } else if (statusFilter === "final_approve_wbs_mo") {
      filtered = filtered.filter((i) => i.closeCriteria === "Final_Approve_WBS_MO");
    } else if (statusFilter === "ineligible") {
      filtered = filtered.filter((i) => !i.eligible && !i.isClosed);
    }

    // Pagination
    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const skip = (page - 1) * limit;
    const paginatedItems = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: serializeData(paginatedItems),
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data status CAPEX" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, closedBy } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Daftar ID CAPEX tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (action !== "close" && action !== "reopen") {
      return NextResponse.json(
        { success: false, error: "Aksi tidak valid (hanya 'close' atau 'reopen')" },
        { status: 400 }
      );
    }

    const bigIntIds = ids.map((id) => BigInt(id));

    // Fetch target records
    const targetItems = await prisma.total.findMany({
      where: { idTotal: { in: bigIntIds } },
    });

    if (targetItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data CAPEX tidak ditemukan" },
        { status: 404 }
      );
    }

    if (action === "close") {
      // Validate eligibility for each item
      const eligibleToClose: bigint[] = [];
      const failedReasons: { id: string; capexNo: string | null; reason: string }[] = [];

      for (const item of targetItems) {
        const evalRes = evaluateCapexCloseEligibility(item);
        if (evalRes.eligible) {
          eligibleToClose.push(item.idTotal);
        } else {
          failedReasons.push({
            id: item.idTotal.toString(),
            capexNo: item.capexNo,
            reason: evalRes.reason,
          });
        }
      }

      if (eligibleToClose.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Tidak ada data yang memenuhi syarat untuk ditutup (Sudah Close).",
            details: failedReasons,
          },
          { status: 422 }
        );
      }

      // Perform update to Sudah Close
      await prisma.total.updateMany({
        where: { idTotal: { in: eligibleToClose } },
        data: {
          statusCapex: StatusCapex.Sudah_Close,
          isManuallyClose: true,
          closedAt: new Date(),
          closedBy: (closedBy || "Admin CAPEX").trim(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil mengubah ${eligibleToClose.length} CAPEX menjadi 'Sudah Close'`,
        updatedCount: eligibleToClose.length,
        skippedCount: failedReasons.length,
        skippedDetails: failedReasons,
      });
    }

    if (action === "reopen") {
      // Reopen / revert each item back to its natural status
      let reopenedCount = 0;

      for (const item of targetItems) {
        // Calculate restored status
        let restoredStatus: StatusCapex = StatusCapex.Belum_Created;
        if (item.nomorPr) {
          restoredStatus = StatusCapex.Sudah_PO;
        } else if (item.budgetStatus === BudgetStatus.approved) {
          restoredStatus = StatusCapex.Final_Approve;
        } else if (item.capexNo && item.budgetStatus === BudgetStatus.in_process) {
          restoredStatus = StatusCapex.Sudah_Created;
        } else if (item.capexNo) {
          restoredStatus = StatusCapex.Sudah_Created;
        }

        await prisma.total.update({
          where: { idTotal: item.idTotal },
          data: {
            statusCapex: restoredStatus,
            isManuallyClose: false,
            closedAt: null,
            closedBy: null,
          },
        });
        reopenedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil membuka kembali ${reopenedCount} CAPEX ke status operasional`,
        updatedCount: reopenedCount,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.error("Error in PATCH /api/admin/status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status CAPEX" },
      { status: 500 }
    );
  }
}
