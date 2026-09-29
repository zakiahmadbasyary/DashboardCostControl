import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/hpp - Mengambil data HPP beserta relasi MasterSheet dan Budget
export async function GET() {
  try {
    const lokasiHppList = await prisma.lokasiHPP.findMany({
      include: {
        masterSheet: true,
        budgetItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const aktivitasHppList = await prisma.aktivitasHPP.findMany({
      include: {
        masterSheet: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data HPP berhasil dimuat",
      count: {
        lokasiHPP: lokasiHppList.length,
        aktivitasHPP: aktivitasHppList.length,
      },
      data: {
        lokasiHPP: lokasiHppList,
        aktivitasHPP: aktivitasHppList,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data HPP dari database",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// POST /api/hpp - Tes insert data LokasiHPP baru ke database
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      idLokasiHpp,
      lokasi,
      idBudget,
      periode,
      status,
      qtyPanen,
      luasPanen,
      luasAktif,
      group,
      descGroup,
      jenisBiaya,
      biaya,
    } = body;

    // Validasi field wajib
    if (!idLokasiHpp || !lokasi || !idBudget) {
      return NextResponse.json(
        {
          success: false,
          message: "Field idLokasiHpp, lokasi, dan idBudget wajib diisi.",
        },
        { status: 400 }
      );
    }

    const newRecord = await prisma.lokasiHPP.create({
      data: {
        idLokasiHpp,
        lokasi,
        idBudget,
        periode: Number(periode) || 1,
        status: status || "NFSC",
        qtyPanen: qtyPanen ?? 0,
        luasPanen: luasPanen ?? 0,
        luasAktif: luasAktif ?? 0,
        group: group || "ZN01",
        descGroup: descGroup || "Zone Description",
        jenisBiaya: jenisBiaya || "Umum",
        biaya: biaya ?? 0,
      },
      include: {
        masterSheet: true,
        budgetItem: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil menambahkan data LokasiHPP baru!",
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan data LokasiHPP",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
