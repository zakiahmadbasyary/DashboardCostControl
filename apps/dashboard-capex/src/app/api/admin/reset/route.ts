import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runCapexReconciliation } from "@/lib/reconciliation";

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();
    const cleanCategory = String(category || "").toLowerCase().trim();

    let deletedCount = 0;
    let label = "";

    await prisma.$transaction(async (tx) => {
      switch (cleanCategory) {
        case "created":
          label = "Created";
          const resCreated = await tx.created.deleteMany();
          deletedCount = resCreated.count;
          break;

        case "po":
          label = "PO";
          await tx.total.updateMany({ data: { nomorPr: null } });
          const resPo = await tx.po.deleteMany();
          deletedCount = resPo.count;
          break;

        case "budget":
          label = "Budget";
          const resBudget = await tx.budget.deleteMany();
          deletedCount = resBudget.count;
          break;

        case "purchasing":
          label = "Purchasing";
          await tx.po.updateMany({ data: { pgr: null } });
          const resPurchasing = await tx.purchasing.deleteMany();
          deletedCount = resPurchasing.count;
          break;

        case "kategori":
          label = "Kategori";
          const resKategori = await tx.kategori.deleteMany();
          deletedCount = resKategori.count;
          break;

        case "approver":
        case "user_approver":
        case "user approver":
          label = "User Approver";
          const resApprover = await tx.userApprover.deleteMany();
          deletedCount = resApprover.count;
          break;

        case "cost_center":
        case "costcenter":
        case "cost center":
        case "master_cost_center":
          label = "Master Cost Center";
          await tx.total.updateMany({ data: { costCenter: null } });
          await tx.created.updateMany({ data: { costCenter: null } });
          await tx.budget.updateMany({ data: { costCenter: null } });
          await tx.kategori.updateMany({ data: { costCenter: null } });
          const resCostCenter = await tx.costCenter.deleteMany();
          deletedCount = resCostCenter.count;
          break;

        default:
          throw new Error("Kategori tidak valid untuk reset data.");
      }
    });

    // Auto-reconcile if created, po, or budget was cleared
    if (["created", "po", "budget"].includes(cleanCategory)) {
      try {
        await runCapexReconciliation();
      } catch (err) {
        console.error("Error in reconciliation after reset:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengosongkan ${deletedCount} data pada tabel ${label}.`,
    });
  } catch (error) {
    console.error("Error resetting category data:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Gagal mengosongkan data tabel.",
      },
      { status: 500 }
    );
  }
}
