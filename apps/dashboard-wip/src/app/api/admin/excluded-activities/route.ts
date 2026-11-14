import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.excludedActivity.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: unknown) {
    console.error("Error fetching excluded activities:", error);
    return NextResponse.json(
      { success: false, data: [], message: "Gagal memuat data blacklist aktivitas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data aktivitas yang dikirim." },
        { status: 400 }
      );
    }

    // Filter valid items (kodeAktivitas wajib ada)
    const validItems = items
      .map((item: { kodeAktivitas?: string; deskripsi?: string }) => ({
        kodeAktivitas: String(item.kodeAktivitas || "").trim(),
        deskripsi: String(item.deskripsi || "").trim(),
      }))
      .filter((item: { kodeAktivitas: string }) => item.kodeAktivitas.length > 0);

    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kode aktivitas tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Upsert each item
    const results = await prisma.$transaction(
      validItems.map((item: { kodeAktivitas: string; deskripsi: string }) =>
        prisma.excludedActivity.upsert({
          where: {
            kodeAktivitas: item.kodeAktivitas,
          },
          update: {
            deskripsi: item.deskripsi || item.kodeAktivitas,
            isActive: true,
          },
          create: {
            kodeAktivitas: item.kodeAktivitas,
            deskripsi: item.deskripsi || item.kodeAktivitas,
            isActive: true,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `Berhasil menyimpan ${results.length} aktivitas ke daftar blacklist.`,
    });
  } catch (error: unknown) {
    console.error("Error saving excluded activities:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan blacklist aktivitas." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (typeof id !== "number" || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Parameter 'id' dan 'isActive' diperlukan." },
        { status: 400 }
      );
    }

    const updated = await prisma.excludedActivity.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status aktivitas ${updated.kodeAktivitas} berhasil diperbarui.`,
    });
  } catch (error: unknown) {
    console.error("Error updating excluded activity status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status aktivitas." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: number[] = Array.isArray(body?.ids)
      ? body.ids.map(Number).filter((n: number) => !isNaN(n))
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar ID untuk dihapus tidak valid." },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.excludedActivity.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      count: deleteResult.count,
      message: `Berhasil menghapus ${deleteResult.count} aktivitas dari daftar blacklist.`,
    });
  } catch (error: unknown) {
    console.error("Error deleting excluded activities:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus aktivitas dari blacklist." },
      { status: 500 }
    );
  }
}
