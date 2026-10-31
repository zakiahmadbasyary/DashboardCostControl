import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma, StatusCapex } from "@/generated/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");
    const costCenter = searchParams.get("costCenter");
    const statusCapex = searchParams.get("statusCapex");
    const tahun = searchParams.get("tahun");
    const search = searchParams.get("search");

    const where: Prisma.TotalWhereInput = {};

    // 1. Filter Cost Center
    if (costCenter && costCenter !== "Semua") {
      where.costCenter = costCenter;
    }

    // 2. Filter Status CAPEX
    if (statusCapex && statusCapex !== "Semua") {
      where.statusCapex = statusCapex as StatusCapex;
    }

    // 3. Filter Tahun
    if (tahun && tahun !== "Semua") {
      const yearNum = parseInt(tahun, 10);
      if (!isNaN(yearNum)) {
        where.tahun = yearNum;
      }
    }

    // 4. Search Filter
    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { capexNo: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
        { io: { contains: s, mode: "insensitive" } },
        { mo: { contains: s, mode: "insensitive" } },
        { wbs: { contains: s, mode: "insensitive" } },
        { costCenter: { contains: s, mode: "insensitive" } },
        { nomorPr: { contains: s, mode: "insensitive" } },
      ];
    }

    // 5. Query Total records with related PO, Purchasing, and Created tracking
    const rawTotals = await prisma.total.findMany({
      where,
      include: {
        po: {
          include: {
            purchasing: true,
          },
        },
        createdList: {
          orderBy: {
            reqDate: "asc",
          },
        },
        budgetList: {
          select: {
            kategori: true,
          },
        },
      },
      orderBy: [
        { idTotal: "asc" },
      ],
    });

    // 6. Resolve Kategori and serialize BigInt / Decimal safely
    // Fetch master kategori for capexNo mapping
    const capexNos = rawTotals.map((t) => t.capexNo).filter((c): c is string => Boolean(c));
    const kategoriMasterRecords = await prisma.kategori.findMany({
      where: {
        capexNo: { in: capexNos },
      },
      select: {
        capexNo: true,
        kategori: true,
      },
    });
    const kategoriMap = new Map<string, string>();
    kategoriMasterRecords.forEach((k) => {
      if (k.kategori) kategoriMap.set(k.capexNo, k.kategori);
    });

    const serialized = rawTotals.map((item) => {
      // Priority for kategori: Master Kategori -> Budget -> "—"
      let resolvedKategori: string | null = null;
      if (item.capexNo && kategoriMap.has(item.capexNo)) {
        resolvedKategori = kategoriMap.get(item.capexNo) || null;
      }
      if (!resolvedKategori && item.budgetList.length > 0) {
        resolvedKategori = item.budgetList[0].kategori;
      }

      return {
        idTotal: item.idTotal.toString(),
        nomorPr: item.nomorPr,
        capexNo: item.capexNo,
        description: item.description,
        budgetType: item.budgetType,
        budgetStatus: item.budgetStatus,
        reqDate: item.reqDate ? item.reqDate.toISOString().split("T")[0] : null,
        quantity: item.quantity ? Number(item.quantity) : null,
        amount: item.amount ? Number(item.amount) : null,
        costCenter: item.costCenter,
        io: item.io,
        mo: item.mo,
        wbs: item.wbs,
        statusCapex: item.statusCapex,
        tahun: item.tahun,
        komoditi: item.komoditi,
        isManuallyClose: item.isManuallyClose,
        closedAt: item.closedAt ? item.closedAt.toISOString() : null,
        closedBy: item.closedBy,
        kategori: resolvedKategori,
        po: item.po
          ? {
              nomorPr: item.po.nomorPr,
              keterangan: item.po.keterangan,
              quantity: item.po.quantity ? Number(item.po.quantity) : null,
              unitOfMeasure: item.po.unitOfMeasure,
              valuationPrice: item.po.valuationPrice ? Number(item.po.valuationPrice) : null,
              total: item.po.total ? Number(item.po.total) : null,
              noPo: item.po.noPo,
              pgr: item.po.pgr,
              purchasing: item.po.purchasing
                ? {
                    pgr: item.po.purchasing.pgr,
                    description: item.po.purchasing.description,
                    telephone: item.po.purchasing.telephone,
                    faxNumber: item.po.purchasing.faxNumber,
                  }
                : null,
            }
          : null,
        createdList: item.createdList
          .map((c) => ({
            idCreated: c.idCreated.toString(),
            byte: c.byte ?? null,
            capexNo: c.capexNo,
            type: c.type,
            requestor: c.requestor,
            reqDate: c.reqDate ? c.reqDate.toISOString().split("T")[0] : null,
            nama: c.nama,
            dateApprove: c.dateApprove ? c.dateApprove.toISOString().split("T")[0] : null,
            notes: c.notes,
            budgetStatus: c.budgetStatus,
            kodeApprover: c.kodeApprover,
          }))
          .sort((a, b) => {
            // Prioritas 1: urutan nomor step / byte approver (1, 2, 3...)
            if (a.byte !== null && b.byte !== null) {
              if (a.byte !== b.byte) return a.byte - b.byte;
            } else if (a.byte !== null) {
              return -1;
            } else if (b.byte !== null) {
              return 1;
            }

            // Prioritas 2 (fallback): urutan dateApprove (duluan -> baru -> null paling bawah)
            if (a.dateApprove && b.dateApprove) {
              const cmp = a.dateApprove.localeCompare(b.dateApprove);
              if (cmp !== 0) return cmp;
              return Number(a.idCreated) - Number(b.idCreated);
            }
            if (a.dateApprove && !b.dateApprove) return -1;
            if (!a.dateApprove && b.dateApprove) return 1;
            return Number(a.idCreated) - Number(b.idCreated);
          }),
      };
    });

    // 7. If Kategori filter is applied, filter the resolved list
    const filtered =
      kategori && kategori !== "Semua"
        ? serialized.filter((item) => item.kategori === kategori)
        : serialized;

    return NextResponse.json({
      success: true,
      totalCount: filtered.length,
      data: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar CAPEX",
        error: message,
      },
      { status: 500 }
    );
  }
}
