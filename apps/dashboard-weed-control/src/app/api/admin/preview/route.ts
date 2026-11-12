import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTab = (searchParams.get("tab") || "lokasi").toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").trim();
    const skip = (page - 1) * limit;

    // Normalisasi tab ke salah satu dari 3 kategori utama
    let tab = "lokasi";
    if (rawTab === "timeline" || rawTab === "data_timeline" || rawTab === "data_material") {
      tab = "timeline";
    } else if (rawTab === "aktivitas" || rawTab === "data_aktivitas") {
      tab = "aktivitas";
    }

    let data: any[] = [];
    let total = 0;
    let materialColumns: string[] = [];
    let maxUmur = 20;

    // =========================================================================
    // 1. DATA LOKASI (Seperti Excel: Mastersheet + Umur 1 s/d Umur 20)
    // =========================================================================
    if (tab === "lokasi") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { wilayah: { contains: search, mode: "insensitive" } },
              { status: { contains: search, mode: "insensitive" } },
              { jenis: { contains: search, mode: "insensitive" } },
              { kelas: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [count, rows, maxUmurRow] = await Promise.all([
        prisma.mastersheet.count({ where }),
        prisma.mastersheet.findMany({
          where,
          orderBy: { lokasi: "asc" },
          skip,
          take: limit,
          include: {
            costUmurList: {
              orderBy: { umur: "asc" },
            },
          },
        }),
        prisma.costUmur.findFirst({
          orderBy: { umur: "desc" },
          select: { umur: true },
        }),
      ]);

      total = count;
      maxUmur = Math.max(20, maxUmurRow?.umur || 20);

      data = rows.map((r) => {
        const costUmurMap: Record<number, number> = {};
        for (const cu of r.costUmurList || []) {
          costUmurMap[cu.umur] = Number(cu.cost);
        }

        return {
          lokasi: r.lokasi,
          status: r.status,
          wilayah: r.wilayah,
          luas: r.luas !== null ? Number(r.luas) : null,
          jenis: r.jenis,
          kelas: r.kelas,
          mulaiRawat: r.mulaiRawat,
          mulaiTanam: r.mulaiTanam,
          forcingStandar: r.forcingStandar,
          realForcing: r.realForcing,
          selesaiPanen: r.selesaiPanen,
          umurForcing: r.umurForcing,
          umur: r.umur,
          totalCost: r.totalCost !== null ? Number(r.totalCost) : null,
          costUmurMap,
        };
      });
    }

    // =========================================================================
    // 2. DATA TIMELINE (Seperti Excel: Timeline + Kolom Bahan Kimia Dinamis)
    // =========================================================================
    else if (tab === "timeline") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { aktivitas: { contains: search, mode: "insensitive" } },
              {
                materialList: {
                  some: {
                    namaMaterial: { contains: search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {};

      const [count, rows, distinctMats] = await Promise.all([
        prisma.dataTimeline.count({ where }),
        prisma.dataTimeline.findMany({
          where,
          orderBy: [{ tanggalRealisasi: "desc" }, { id: "asc" }],
          skip,
          take: limit,
          include: {
            materialList: {
              orderBy: { id: "asc" },
            },
          },
        }),
        prisma.dataMaterial.findMany({
          select: { namaMaterial: true },
          distinct: ["namaMaterial"],
          orderBy: { namaMaterial: "asc" },
        }),
      ]);

      total = count;
      materialColumns = distinctMats.map((m) => m.namaMaterial);

      data = rows.map((r) => {
        const materialsMap: Record<string, number> = {};
        for (const m of r.materialList || []) {
          materialsMap[m.namaMaterial] = Number(m.quantity);
        }

        return {
          id: r.id.toString(),
          lokasi: r.lokasi,
          awalRawat: r.awalRawat,
          aktivitas: r.aktivitas,
          tanggalRealisasi: r.tanggalRealisasi,
          umur: r.umur,
          hasil: r.hasil !== null ? Number(r.hasil) : null,
          uom: r.uom,
          tk: r.tk !== null ? Number(r.tk) : null,
          kapasitasPerTk: r.kapasitasPerTk !== null ? Number(r.kapasitasPerTk) : null,
          totalCost: r.totalCost !== null ? Number(r.totalCost) : null,
          upah: r.upah !== null ? Number(r.upah) : null,
          charge: r.charge !== null ? Number(r.charge) : null,
          material: r.material !== null ? Number(r.material) : null,
          materialsMap,
        };
      });
    }

    // =========================================================================
    // 3. DATA AKTIVITAS (Seperti Excel: Denormalisasi Kolom Aktivitas)
    // =========================================================================
    else if (tab === "aktivitas") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { aktivitas: { contains: search, mode: "insensitive" } },
              { kode: { contains: search, mode: "insensitive" } },
              { activityGroup: { contains: search, mode: "insensitive" } },
              { wilayah: { contains: search, mode: "insensitive" } },
              { status: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [count, rows] = await Promise.all([
        prisma.dataAktivitas.count({ where }),
        prisma.dataAktivitas.findMany({
          where,
          orderBy: [{ id: "asc" }],
          skip,
          take: limit,
        }),
      ]);

      total = count;

      data = rows.map((r) => ({
        id: r.id.toString(),
        lokasi: r.lokasi,
        status: r.status,
        wilayah: r.wilayah,
        luas: r.luas !== null ? Number(r.luas) : null,
        kelas: r.kelas,
        kode: r.kode,
        aktivitas: r.aktivitas,
        biaya: r.biaya !== null ? Number(r.biaya) : null,
        biayaPerHa: r.biayaPerHa !== null ? Number(r.biayaPerHa) : null,
        upah: r.upah !== null ? Number(r.upah) : null,
        charge: r.charge !== null ? Number(r.charge) : null,
        material: r.material !== null ? Number(r.material) : null,
        bibit: r.bibit !== null ? Number(r.bibit) : null,
        hasil: r.hasil !== null ? Number(r.hasil) : null,
        uom: r.uom,
        activityGroup: r.activityGroup,
      }));
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
      materialColumns,
      maxUmur,
    });
  } catch (err: any) {
    console.error("Error in preview route:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal mengambil data preview." },
      { status: 500 }
    );
  }
}
