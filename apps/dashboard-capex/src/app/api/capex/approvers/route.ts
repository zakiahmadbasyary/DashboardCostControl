import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch all UserApprovers
    const approvers = await prisma.userApprover.findMany({
      orderBy: {
        kodeApprover: "asc",
      },
      include: {
        createdList: {
          where: {
            dateApprove: null,
          },
          orderBy: {
            reqDate: "asc",
          },
        },
      },
    });

    // 2. Map approvers and their pending items safely
    const data = approvers.map((app) => {
      const pendingItems = app.createdList.map((item) => ({
        idCreated: item.idCreated.toString(),
        capexNo: item.capexNo,
        description: item.description,
        amount: item.amount ? Number(item.amount) : null,
        io: item.io,
        mo: item.mo,
        wbs: item.wbs,
        reqDate: item.reqDate ? item.reqDate.toISOString().split("T")[0] : null,
        budgetStatus: item.budgetStatus,
        notes: item.notes,
        dateApprove: item.dateApprove ? item.dateApprove.toISOString().split("T")[0] : null,
      }));

      return {
        kodeApprover: app.kodeApprover,
        nama: app.nama,
        pendingCount: pendingItems.length,
        pendingItems,
      };
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
