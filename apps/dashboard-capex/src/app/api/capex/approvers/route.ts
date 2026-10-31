import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PendingCapexItem, UserApproverItem } from "@/types/capex";

export async function GET() {
  try {
    // 1. Fetch all UserApprovers
    const approvers = await prisma.userApprover.findMany({
      orderBy: {
        kodeApprover: "asc",
      },
    });

    // 2. Fetch all Created records ordered by workflow sequence (byte asc, then idCreated asc)
    const allCreated = await prisma.created.findMany({
      orderBy: [
        { byte: "asc" },
        { idCreated: "asc" },
      ],
    });

    // 3. Group Created records by CAPEX / PR identity
    // Grouping priority: capexNo -> noPr -> individual idCreated
    const groupedCapex = new Map<string, typeof allCreated>();
    for (const item of allCreated) {
      const key = item.capexNo?.trim() || (item.noPr ? `PR_${item.noPr.trim()}` : `ID_${item.idCreated}`);
      const list = groupedCapex.get(key) || [];
      list.push(item);
      groupedCapex.set(key, list);
    }

    // 4. Map for accumulating pending items per approver code
    const pendingByApprover = new Map<string, PendingCapexItem[]>();

    // 5. Evaluate sequential approval for each CAPEX group
    // Sequential rule: only the FIRST approver in sequence whose dateApprove is null receives the pending status.
    for (const [, items] of groupedCapex.entries()) {
      // Pastikan items terurut berdasarkan byte asc (workflow step), fallback ke idCreated
      items.sort((a, b) => {
        if (a.byte !== null && b.byte !== null) {
          if (a.byte !== b.byte) return a.byte - b.byte;
        } else if (a.byte !== null) {
          return -1;
        } else if (b.byte !== null) {
          return 1;
        }
        return Number(a.idCreated) - Number(b.idCreated);
      });

      // Find the first approver in the sequence that has NOT approved yet (dateApprove == null)
      const activePendingItem = items.find((row) => row.dateApprove === null);

      if (activePendingItem && activePendingItem.kodeApprover) {
        const code = activePendingItem.kodeApprover.trim();
        const currentList = pendingByApprover.get(code) || [];

        currentList.push({
          idCreated: activePendingItem.idCreated.toString(),
          byte: activePendingItem.byte,
          capexNo: activePendingItem.capexNo,
          description: activePendingItem.description,
          amount: activePendingItem.amount ? Number(activePendingItem.amount) : null,
          io: activePendingItem.io,
          mo: activePendingItem.mo,
          wbs: activePendingItem.wbs,
          reqDate: activePendingItem.reqDate ? activePendingItem.reqDate.toISOString().split("T")[0] : null,
          budgetStatus: activePendingItem.budgetStatus,
          notes: activePendingItem.notes,
          dateApprove: activePendingItem.dateApprove ? activePendingItem.dateApprove.toISOString().split("T")[0] : null,
        });

        pendingByApprover.set(code, currentList);
      }
    }

    // 6. Assemble response matching UserApproverItem structure and sort by pendingCount descending
    const data: UserApproverItem[] = approvers
      .map((app) => {
        const code = app.kodeApprover.trim();
        const pendingItems = pendingByApprover.get(code) || [];

        return {
          kodeApprover: app.kodeApprover,
          nama: app.nama,
          pendingCount: pendingItems.length,
          pendingItems,
        };
      })
      .sort((a, b) => {
        if (b.pendingCount !== a.pendingCount) {
          return b.pendingCount - a.pendingCount;
        }
        return (a.nama || a.kodeApprover).localeCompare(b.nama || b.kodeApprover);
      });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data user approver dan pending CAPEX",
        error: message,
      },
      { status: 500 }
    );
  }
}
