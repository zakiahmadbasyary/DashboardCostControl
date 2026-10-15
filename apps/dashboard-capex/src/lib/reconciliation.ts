import prisma from "@/lib/prisma";
import { BudgetStatus, StatusCapex } from "@prisma/client";

/**
 * Reconciles Budget, Created, and PO tables into the Total table
 * according to confirmed CAPEX business rules.
 * 
 * Rules:
 * 1. Preserves records where isManuallyClose === true (Sudah Close).
 * 2. Groups Budget and Created with the same capex_no.
 * 3. Budget rows with empty/null capex_no remain standalone Total records.
 * 4. Created rows with capex_no not in Budget still generate a Total record.
 * 5. Respects field priorities (amount: Budget -> Created; others: Created -> Budget).
 * 6. Calculates status_capex according to priority rules.
 * 7. Links back id_total in Budget and Created.
 */
export async function runCapexReconciliation() {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch existing manually closed Total records to preserve them
    const manuallyClosedTotals = await tx.total.findMany({
      where: { isManuallyClose: true },
    });
    const preservedCapexNos = new Set(
      manuallyClosedTotals
        .map((t) => t.capexNo)
        .filter((c): c is string => Boolean(c))
    );

    // 2. Fetch all raw source data
    const allBudgets = await tx.budget.findMany();
    const allCreated = await tx.created.findMany({
      orderBy: { reqDate: "asc" },
    });
    const allPo = await tx.po.findMany();
    const poSet = new Set(allPo.map((p) => p.nomorPr));

    // 3. Clear non-manually closed Total records
    // Unlink foreign keys first to avoid constraint conflicts
    await tx.budget.updateMany({
      where: {
        totalRecord: { isManuallyClose: false },
      },
      data: { idTotal: null },
    });
    await tx.created.updateMany({
      where: {
        totalRecord: { isManuallyClose: false },
      },
      data: { idTotal: null },
    });

    await tx.total.deleteMany({
      where: { isManuallyClose: false },
    });

    // 4. Group data by capexNo
    // a. Group Created by capexNo
    const createdByCapexNo = new Map<string, typeof allCreated>();
    const createdWithoutCapex: typeof allCreated = [];

    for (const c of allCreated) {
      const cleanCapex = c.capexNo?.trim();
      if (cleanCapex) {
        if (!createdByCapexNo.has(cleanCapex)) {
          createdByCapexNo.set(cleanCapex, []);
        }
        createdByCapexNo.get(cleanCapex)!.push(c);
      } else {
        createdWithoutCapex.push(c);
      }
    }

    // b. Group Budget by capexNo
    const budgetByCapexNo = new Map<string, typeof allBudgets>();
    const budgetWithoutCapex: typeof allBudgets = [];

    for (const b of allBudgets) {
      const cleanCapex = b.capexNo?.trim();
      if (cleanCapex) {
        if (!budgetByCapexNo.has(cleanCapex)) {
          budgetByCapexNo.set(cleanCapex, []);
        }
        budgetByCapexNo.get(cleanCapex)!.push(b);
      } else {
        budgetWithoutCapex.push(b);
      }
    }

    // Combine all unique capexNo keys (excluding those manually closed)
    const allCapexNos = new Set<string>([
      ...Array.from(createdByCapexNo.keys()),
      ...Array.from(budgetByCapexNo.keys()),
    ]);

    // Keep track of used nomorPr to respect unique constraint on Total.nomor_pr
    const usedNomorPr = new Set<string>(
      manuallyClosedTotals.map((t) => t.nomorPr).filter((p): p is string => Boolean(p))
    );

    // 5. Process grouped CAPEX items
    for (const capexNo of allCapexNos) {
      // If this capexNo is already manually closed, link items to existing Total
      if (preservedCapexNos.has(capexNo)) {
        const closedTotal = manuallyClosedTotals.find((t) => t.capexNo === capexNo);
        if (closedTotal) {
          const cList = createdByCapexNo.get(capexNo) || [];
          const bList = budgetByCapexNo.get(capexNo) || [];
          if (cList.length > 0) {
            await tx.created.updateMany({
              where: { idCreated: { in: cList.map((c) => c.idCreated) } },
              data: { idTotal: closedTotal.idTotal },
            });
          }
          if (bList.length > 0) {
            await tx.budget.updateMany({
              where: { idBudget: { in: bList.map((b) => b.idBudget) } },
              data: { idTotal: closedTotal.idTotal },
            });
          }
        }
        continue;
      }

      const cList = createdByCapexNo.get(capexNo) || [];
      const bList = budgetByCapexNo.get(capexNo) || [];

      // Representative row from Created: earliest reqDate
      const cRep = cList.length > 0 ? cList[0] : null;
      const bRep = bList.length > 0 ? bList[0] : null;

      // Extract fields with priority
      const description = cRep?.description || bRep?.description || null;
      const budgetType = cRep?.budgetType || null;
      const budgetStatus = cRep?.budgetStatus || bRep?.budgetStatus || null;
      const reqDate = cRep?.reqDate || null;
      const quantity = cRep?.quantity ?? bRep?.quantity ?? null;
      
      // Amount priority: Budget -> Created
      const amount = bRep?.amount ?? cRep?.amount ?? null;
      
      const costCenter = cRep?.costCenter || bRep?.costCenter || null;
      const io = cRep?.io || bRep?.io || null;
      const mo = cRep?.mo || bRep?.mo || null;
      const wbs = cRep?.wbs || bRep?.wbs || null;
      const komoditi = cRep?.komoditi || bRep?.komoditi || null;

      // nomorPr from Created.noPr (must exist in PO and not duplicate)
      let nomorPr: string | null = null;
      if (cRep?.noPr && poSet.has(cRep.noPr) && !usedNomorPr.has(cRep.noPr)) {
        nomorPr = cRep.noPr;
        usedNomorPr.add(cRep.noPr);
      }

      // Compute status_capex
      let statusCapex: StatusCapex = StatusCapex.Belum_Created;
      if (nomorPr && io && !wbs && !mo) {
        statusCapex = StatusCapex.Sudah_PO;
      } else if (budgetStatus === BudgetStatus.approved) {
        statusCapex = StatusCapex.Final_Approve;
      } else if (capexNo && budgetStatus === BudgetStatus.in_process) {
        statusCapex = StatusCapex.Sudah_Created;
      } else if (!capexNo && !budgetStatus) {
        statusCapex = StatusCapex.Belum_Created;
      } else if (capexNo) {
        statusCapex = StatusCapex.Sudah_Created;
      }

      const tahun = reqDate ? reqDate.getFullYear() : new Date().getFullYear();

      // Create new Total record
      const createdTotal = await tx.total.create({
        data: {
          nomorPr,
          capexNo,
          description,
          budgetType,
          budgetStatus,
          reqDate,
          quantity,
          amount,
          costCenter,
          io,
          mo,
          wbs,
          statusCapex,
          tahun,
          komoditi,
          isManuallyClose: false,
        },
      });

      // Link Created and Budget back to idTotal
      if (cList.length > 0) {
        await tx.created.updateMany({
          where: { idCreated: { in: cList.map((c) => c.idCreated) } },
          data: { idTotal: createdTotal.idTotal },
        });
      }
      if (bList.length > 0) {
        await tx.budget.updateMany({
          where: { idBudget: { in: bList.map((b) => b.idBudget) } },
          data: { idTotal: createdTotal.idTotal },
        });
      }
    }

    // 6. Standalone Budget rows with no capexNo
    for (const b of budgetWithoutCapex) {
      const description = b.description || null;
      const budgetStatus = b.budgetStatus || null;
      const quantity = b.quantity || null;
      const amount = b.amount || null;
      const costCenter = b.costCenter || null;
      const io = b.io || null;
      const mo = b.mo || null;
      const wbs = b.wbs || null;
      const komoditi = b.komoditi || null;

      let statusCapex: StatusCapex = StatusCapex.Belum_Created;
      if (budgetStatus === BudgetStatus.approved) {
        statusCapex = StatusCapex.Final_Approve;
      } else if (budgetStatus === BudgetStatus.in_process) {
        statusCapex = StatusCapex.Sudah_Created;
      }

      const tahun = new Date().getFullYear();

      const createdTotal = await tx.total.create({
        data: {
          nomorPr: null,
          capexNo: null,
          description,
          budgetType: null,
          budgetStatus,
          reqDate: null,
          quantity,
          amount,
          costCenter,
          io,
          mo,
          wbs,
          statusCapex,
          tahun,
          komoditi,
          isManuallyClose: false,
        },
      });

      await tx.budget.update({
        where: { idBudget: b.idBudget },
        data: { idTotal: createdTotal.idTotal },
      });
    }

    // 7. Standalone Created rows with no capexNo
    for (const c of createdWithoutCapex) {
      let nomorPr: string | null = null;
      if (c.noPr && poSet.has(c.noPr) && !usedNomorPr.has(c.noPr)) {
        nomorPr = c.noPr;
        usedNomorPr.add(c.noPr);
      }

      let statusCapex: StatusCapex = StatusCapex.Belum_Created;
      if (nomorPr && c.io && !c.wbs && !c.mo) {
        statusCapex = StatusCapex.Sudah_PO;
      } else if (c.budgetStatus === BudgetStatus.approved) {
        statusCapex = StatusCapex.Final_Approve;
      } else if (c.budgetStatus === BudgetStatus.in_process) {
        statusCapex = StatusCapex.Sudah_Created;
      }

      const tahun = c.reqDate ? c.reqDate.getFullYear() : new Date().getFullYear();

      const createdTotal = await tx.total.create({
        data: {
          nomorPr,
          capexNo: null,
          description: c.description,
          budgetType: c.budgetType,
          budgetStatus: c.budgetStatus,
          reqDate: c.reqDate,
          quantity: c.quantity,
          amount: c.amount,
          costCenter: c.costCenter,
          io: c.io,
          mo: c.mo,
          wbs: c.wbs,
          statusCapex,
          tahun,
          komoditi: c.komoditi,
          isManuallyClose: false,
        },
      });

      await tx.created.update({
        where: { idCreated: c.idCreated },
        data: { idTotal: createdTotal.idTotal },
      });
    }

    const totalCount = await tx.total.count();
    return { success: true, totalCount };
  });
}
