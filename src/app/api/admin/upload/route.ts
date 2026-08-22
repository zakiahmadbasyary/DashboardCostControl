import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import { storage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const category = String(formData.get("category") || "").toLowerCase().trim();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File wajib diunggah." }, { status: 400 });
    }

    const fileName = file.name;
    const fileExt = path.extname(fileName).toLowerCase();

    if (![".xlsx", ".xls", ".csv"].includes(fileExt)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv." },
        { status: 400 }
      );
    }

    // 1. Read file buffer & parse Excel
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ success: false, message: "File Excel kosong atau tidak memiliki sheet." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, message: "File Excel tidak memiliki baris data." }, { status: 400 });
    }

    // 2. Save file archive to storage and rotate (max 3 files) via centralized storage helper
    storage.saveArchiveFile(category, fileName, buffer);

    // 3. Process database import per Category
    let importedCount = 0;
    let categoryTitle = "";

    // Find default admin user for logging
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
    });
    const userId = adminUser?.id;

    // Normalize keys helper
    const getVal = (row: Record<string, unknown>, keys: string[]): unknown => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          (rk) => rk.trim().toLowerCase().replace(/_/g, " ") === k.trim().toLowerCase().replace(/_/g, " ")
        );
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return row[foundKey];
        }
      }
      return undefined;
    };

    if (category === "mastersheet") {
      categoryTitle = "MasterSheet";

      const parsedRows = rawRows
        .map((row) => {
          const lokasi = String(getVal(row, ["lokasi", "Lokasi"]) || "").trim();
          if (!lokasi) return null;

          return {
            lokasi,
            wilayah: String(getVal(row, ["wilayah", "Wilayah"]) || "").trim(),
            luas: Number(getVal(row, ["luas", "Luas"])) || 0,
            kodeBibit: String(
              getVal(row, [
                "kode_bibit",
                "kode bibit",
                "Kode Bibit",
                "kode bibit lokasi",
                "Kode bibit lokasi",
                "Kode Bibit Lokasi",
                "kode_bibit_lokasi",
              ]) || ""
            ).trim(),
            jenisBibit: String(getVal(row, ["jenis_bibit", "jenis", "Jenis Bibit"]) || "").trim(),
            kelasBibit: String(getVal(row, ["kelas_bibit", "kelas", "Kelas Bibit"]) || "").trim(),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'lokasi' tidak ditemukan atau semua data kosong." },
          { status: 400 }
        );
      }

      // Unique by lokasi
      const uniqueMap = new Map<string, typeof parsedRows[0]>();
      parsedRows.forEach((r) => uniqueMap.set(r.lokasi, r));
      const uniqueMasterSheets = Array.from(uniqueMap.values());

      await prisma.$transaction(
        async (tx) => {
          await tx.masterSheet.deleteMany();
          const chunkSize = 1000;
          for (let i = 0; i < uniqueMasterSheets.length; i += chunkSize) {
            const chunk = uniqueMasterSheets.slice(i, i + chunkSize);
            await tx.masterSheet.createMany({
              data: chunk,
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      importedCount = uniqueMasterSheets.length;
    } else if (category === "sbt") {
      categoryTitle = "Data SBT";

      const parsedRows = rawRows
        .map((row) => {
          const kodeSbt = String(getVal(row, ["kode_sbt", "kode sbt", "Kode SBT", "Kode", "code_sbt", "Code SBT"]) || "").trim();
          if (!kodeSbt) return null;

          return {
            kodeSbt,
            nilaiSbt: Number(getVal(row, ["nilai_sbt", "nilai sbt", "Nilai SBT", "SBT"])) || 0,
            status: String(getVal(row, ["status", "Status"]) || "").trim() || null,
            pupuk: String(getVal(row, ["pupuk", "Pupuk"]) || "").trim() || null,
            jenis: String(getVal(row, ["jenis", "Jenis", "jenis_bibit"]) || "").trim() || null,
            kelas: String(getVal(row, ["kelas", "Kelas", "kelas_bibit"]) || "").trim() || null,
            groupCost: String(getVal(row, ["group_cost", "group cost", "Group Cost", "GroupCost"]) || "").trim() || null,
            umur: getVal(row, ["umur", "Umur"]) !== undefined ? Number(getVal(row, ["umur", "Umur"])) : null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'kode_sbt' / 'Kode' tidak ditemukan atau semua data kosong." },
          { status: 400 }
        );
      }

      // Unique by kodeSbt
      const uniqueMap = new Map<string, typeof parsedRows[0]>();
      parsedRows.forEach((r) => uniqueMap.set(r.kodeSbt, r));
      const uniqueSbts = Array.from(uniqueMap.values());

      await prisma.$transaction(
        async (tx) => {
          await tx.sbt.deleteMany();
          const chunkSize = 1000;
          for (let i = 0; i < uniqueSbts.length; i += chunkSize) {
            const chunk = uniqueSbts.slice(i, i + chunkSize);
            await tx.sbt.createMany({
              data: chunk,
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      importedCount = uniqueSbts.length;
    } else if (category === "lokasi") {
      categoryTitle = "Data Lokasi";

      // Fetch MasterSheet relation map
      const masterSheets = await prisma.masterSheet.findMany({
        select: { lokasi: true, jenisBibit: true, kelasBibit: true },
      });

      if (masterSheets.length === 0) {
        return NextResponse.json(
          { success: false, message: "Data MasterSheet belum tersedia di database. Silakan unggah MasterSheet terlebih dahulu (Langkah 1)." },
          { status: 400 }
        );
      }

      const msMap = new Map(masterSheets.map((m) => [m.lokasi, m]));

      // Fetch SBT relation map
      const existingSbts = await prisma.sbt.findMany({
        select: { kodeSbt: true },
      });

      const uniqueSbtSet = new Set(existingSbts.map((s) => s.kodeSbt));
      const defaultSbtCode = "DEFAULT_SBT";

      if (!uniqueSbtSet.has(defaultSbtCode)) {
        await prisma.sbt.upsert({
          where: { kodeSbt: defaultSbtCode },
          update: {},
          create: {
            kodeSbt: defaultSbtCode,
            nilaiSbt: 0,
            status: "DEFAULT",
            groupCost: "Semua",
          },
        });
        uniqueSbtSet.add(defaultSbtCode);
      }

      const missingSbtCodes = new Set<string>();

      const parsedRows = rawRows
        .map((row) => {
          const lokasiCode = String(getVal(row, ["lokasi", "Lokasi"]) || "").trim();
          const ms = msMap.get(lokasiCode);
          if (!ms) return null; // Skip if location is not in MasterSheet

          const status = String(getVal(row, ["status", "Status"]) || "").trim();
          const pupuk = String(getVal(row, ["pupuk", "Pupuk"]) || "").trim();
          const jenisRaw = String(ms.jenisBibit || "").trim();
          const jenisCode = jenisRaw.startsWith("S") ? "S" : jenisRaw.startsWith("C") ? "C" : jenisRaw.startsWith("N") ? "N" : "S";

          const kelasRaw = String(getVal(row, ["kelas_bibit", "Kelas Bibit", "kelas"]) || ms.kelasBibit || "").trim();
          const kelasCode = kelasRaw.startsWith("B") ? "B" : kelasRaw.startsWith("S") ? "S" : kelasRaw.startsWith("K") ? "K" : "B";

          const gcCode = String(getVal(row, ["group_cost", "GroupCost", "group cost"]) || "").trim();
          const ketGroupCost = String(getVal(row, ["keterangan_group_cost", "Keterangan_Group_Cost", "Keterangan Group Cost"]) || "").trim();
          const gc = ketGroupCost || gcCode;
          const umur = Number(getVal(row, ["umur", "Umur"])) || 0;

          const rowKodeSbt = String(getVal(row, ["kode_sbt", "kode sbt", "Kode SBT"]) || "").trim();

          let specificCode = "";
          if (status === "NSSC") {
            specificCode = "NSSC" + gc + umur;
          } else {
            specificCode = status + pupuk + jenisCode + kelasCode + gc + umur;
          }

          let semuaCode = "";
          if (status === "NSSC") {
            semuaCode = "NSSCSemua" + umur;
          } else {
            semuaCode = status + pupuk + jenisCode + kelasCode + "Semua" + umur;
          }

          let finalKodeSbt = defaultSbtCode;
          if (rowKodeSbt && (uniqueSbtSet.has(rowKodeSbt) || missingSbtCodes.has(rowKodeSbt))) {
            finalKodeSbt = rowKodeSbt;
          } else if (uniqueSbtSet.has(specificCode) || missingSbtCodes.has(specificCode)) {
            finalKodeSbt = specificCode;
          } else if (uniqueSbtSet.has(semuaCode) || missingSbtCodes.has(semuaCode)) {
            finalKodeSbt = semuaCode;
          } else if (specificCode) {
            finalKodeSbt = specificCode;
            missingSbtCodes.add(specificCode);
          }

          return {
            lokasi: lokasiCode,
            status,
            kodeSbt: finalKodeSbt,
            umur,
            groupCost: gcCode || ketGroupCost || "General",
            keteranganGroupCost: ketGroupCost || undefined,
            cost: Number(getVal(row, ["cost", "Cost"])) || 0,
            pupuk: pupuk || undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Semua baris lokasi tidak mencocokkan MasterSheet atau data lokasi kosong." },
          { status: 400 }
        );
      }

      // Auto-insert any missing SBT codes
      if (missingSbtCodes.size > 0) {
        const missingSbtRecords = Array.from(missingSbtCodes).map((code) => ({
          kodeSbt: code,
          nilaiSbt: 0,
          status: "AUTO_GENERATED",
        }));
        await prisma.sbt.createMany({
          data: missingSbtRecords,
          skipDuplicates: true,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.lokasi.deleteMany();
          const chunkSize = 1000;
          for (let i = 0; i < parsedRows.length; i += chunkSize) {
            const chunk = parsedRows.slice(i, i + chunkSize);
            await tx.lokasi.createMany({
              data: chunk,
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      importedCount = parsedRows.length;
    } else if (category === "aktivitas") {
      categoryTitle = "Data Aktivitas";

      const masterSheets = await prisma.masterSheet.findMany({
        select: { lokasi: true },
      });

      if (masterSheets.length === 0) {
        return NextResponse.json(
          { success: false, message: "Data MasterSheet belum tersedia di database. Silakan unggah MasterSheet terlebih dahulu (Langkah 1)." },
          { status: 400 }
        );
      }

      const msSet = new Set(masterSheets.map((m) => m.lokasi));

      const parsedRows = rawRows
        .map((row) => {
          const lokasiCode = String(getVal(row, ["lokasi", "Lokasi"]) || "").trim();
          const aktivitas = String(getVal(row, ["aktivitas", "Aktivitas"]) || "").trim();
          if (!lokasiCode || !aktivitas) return null;
          if (!msSet.has(lokasiCode)) return null; // Skip if location is not in MasterSheet

          const groupCostCode = String(getVal(row, ["group_cost", "GroupCost", "Group", "group cost"]) || "").trim();
          const ketGroupCost = String(getVal(row, ["keterangan_group_cost", "Keterangan Group Cost", "Keterangan_Group_Cost"]) || "").trim();

          return {
            lokasi: lokasiCode,
            aktivitas,
            groupCost: groupCostCode || ketGroupCost || "General",
            keteranganGroupCost: ketGroupCost || undefined,
            biaya: Number(getVal(row, ["biaya", "Biaya"])) || 0,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Semua baris aktivitas tidak mencocokkan MasterSheet atau data aktivitas kosong." },
          { status: 400 }
        );
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.aktivitas.deleteMany();
          const chunkSize = 1000;
          for (let i = 0; i < parsedRows.length; i += chunkSize) {
            const chunk = parsedRows.slice(i, i + chunkSize);
            await tx.aktivitas.createMany({
              data: chunk,
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      importedCount = parsedRows.length;
    } else {
      return NextResponse.json({ success: false, message: `Kategori '${category}' tidak dikenal.` }, { status: 400 });
    }

    // 4. Log Activity in PostgreSQL database
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "UPLOAD_DATA",
          dataSource: categoryTitle,
          fileName,
          description: `Berhasil mengganti data ${categoryTitle} dari file ${fileName} (${importedCount.toLocaleString("id-ID")} baris data diproses).`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengunggah dan mengganti data ${categoryTitle}! ${importedCount.toLocaleString("id-ID")} baris data telah diproses ke database.`,
      count: importedCount,
      totalRows: rawRows.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in upload API route:", error);
    return NextResponse.json({ success: false, message: `Gagal memproses import: ${message}` }, { status: 500 });
  }
}
