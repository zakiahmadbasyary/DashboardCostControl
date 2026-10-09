import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      select: {
        idBudget: true,
        group: true,
        status: true,
        periode: true,
        budget: true,
      },
      orderBy: { idBudget: "asc" },
    });

    const response = NextResponse.json({
      status: "success",
      budgets,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error: any) {
    console.error("Error fetching HPP summary:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil ringkasan data HPP" },
      { status: 500 }
    );
  }
}


