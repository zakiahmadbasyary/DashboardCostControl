import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

type ExcelRow = Record<string, unknown>;

async function main() {
  console.log("🌱 Starting database seeding from Excel files in src/data...");

  const dataDir = path.join(process.cwd(), "src", "data");

  // 1. Seed MasterSheet
  console.log("📄 Reading mastersheet.xlsx...");
  const msFile = path.join(dataDir, "mastersheet.xlsx");
  const msWb = XLSX.readFile(msFile);
  const msRows = XLSX.utils.sheet_to_json<ExcelRow>(msWb.Sheets[msWb.SheetNames[0]]);

  console.log(`Clearing existing data...`);
  await prisma.aktivitas.deleteMany();
  await prisma.lokasi.deleteMany();
  await prisma.sbt.deleteMany();
  await prisma.masterSheet.deleteMany();

  console.log(`Inserting ${msRows.length} records into mastersheet...`);
  const masterSheetData = msRows.map((row) => ({
    lokasi: String(row["Lokasi"] || "").trim(),
    wilayah: String(row["Wilayah"] || "").trim(),
    luas: Number(row["Luas"]) || 0,
    kodeBibit: String(row["Kode bibit lokasi"] || row["Kode bibit"] || row["kode_bibit"] || row["kode bibit"] || "").trim(),
    jenisBibit: String(row["Jenis"] || "").trim(),
    kelasBibit: String(row["Kelas"] || "").trim(),
  }));

  // Filter unique lokasi for MasterSheet
  const uniqueMasterSheetMap = new Map<string, typeof masterSheetData[0]>();
  for (const item of masterSheetData) {
    if (item.lokasi && !uniqueMasterSheetMap.has(item.lokasi)) {
      uniqueMasterSheetMap.set(item.lokasi, item);
    }
  }

  await prisma.masterSheet.createMany({
    data: Array.from(uniqueMasterSheetMap.values()),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${uniqueMasterSheetMap.size} unique MasterSheet records.`);

function getVal(row: ExcelRow, keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
  }
  return undefined;
}

  // 2. Seed Data SBT
  console.log("📄 Reading DataSBT.xlsx...");
  const sbtFile = path.join(dataDir, "DataSBT.xlsx");
  const sbtWb = XLSX.readFile(sbtFile);
  const sbtRows = XLSX.utils.sheet_to_json<ExcelRow>(sbtWb.Sheets[sbtWb.SheetNames[0]]);

  console.log(`Inserting ${sbtRows.length} records into sbt...`);
  const sbtData = sbtRows.map((row) => ({
    kodeSbt: String(getVal(row, ["kode_sbt", "kode sbt", "Kode SBT", "Kode", "code_sbt", "Code SBT", "Code"]) || "").trim(),
    nilaiSbt: Number(getVal(row, ["nilai_sbt", "nilai sbt", "Nilai SBT", "SBT"])) || 0,
    status: String(getVal(row, ["status", "Status"]) || "").trim(),
    pupuk: String(getVal(row, ["pupuk", "Pupuk"]) || "").trim(),
    jenis: String(getVal(row, ["jenis", "Jenis"]) || "").trim(),
    kelas: String(getVal(row, ["kelas", "Kelas"]) || "").trim(),
    groupCost: String(getVal(row, ["group_cost", "Group Cost", "GroupCost"]) || "").trim(),
    umur: getVal(row, ["umur", "Umur"]) !== undefined ? Number(getVal(row, ["umur", "Umur"])) : null,
  }));

  const uniqueSbtMap = new Map<string, typeof sbtData[0]>();
  for (const item of sbtData) {
    if (item.kodeSbt && !uniqueSbtMap.has(item.kodeSbt)) {
      uniqueSbtMap.set(item.kodeSbt, item);
    }
  }

  await prisma.sbt.createMany({
    data: Array.from(uniqueSbtMap.values()),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${uniqueSbtMap.size} unique SBT records.`);

  // Load MasterSheet map for quick reference
  const allMasterSheets = await prisma.masterSheet.findMany();
  const msMap = new Map(allMasterSheets.map((m) => [m.lokasi, m]));

  // 3. Seed Data Lokasi
  console.log("📄 Reading DataLokasi.xlsx...");
  const locFile = path.join(dataDir, "DataLokasi.xlsx");
  const locWb = XLSX.readFile(locFile);
  const locRows = XLSX.utils.sheet_to_json<ExcelRow>(locWb.Sheets[locWb.SheetNames[0]]);

  console.log(`Processing ${locRows.length} records for lokasi...`);

  // Ensure default SBT exists for unmapped codes
  const defaultSbtCode = "DEFAULT_SBT";
  if (!uniqueSbtMap.has(defaultSbtCode)) {
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
  }

  const missingSbtCodes = new Set<string>();

  const lokasiDataList = locRows
    .map((row) => {
      const lokasiCode = String(row["Lokasi"] || "").trim();
      const ms = msMap.get(lokasiCode);

      if (!ms) return null; // Skip if location is not in MasterSheet

      const status = String(row["Status"] || row["status"] || "").trim();
      const pupuk = String(row["Pupuk"] || "").trim();
      const jenisRaw = String(ms.jenisBibit || "").trim();
      const jenisCode = jenisRaw.startsWith("S") ? "S" : jenisRaw.startsWith("C") ? "C" : jenisRaw.startsWith("N") ? "N" : "S";

      const kelasRaw = String(row["Kelas Bibit"] || ms.kelasBibit || "").trim();
      const kelasCode = kelasRaw.startsWith("B") ? "B" : kelasRaw.startsWith("S") ? "S" : kelasRaw.startsWith("K") ? "K" : "B";

      const gc = String(row["Keterangan_Group_Cost"] || row["GroupCost"] || "").trim();
      const umur = Number(row["Umur"]) || 0;

      // 1. Try specific group cost code
      let specificCode = "";
      if (status === "NSSC") {
        specificCode = "NSSC" + gc + umur;
      } else {
        specificCode = status + pupuk + jenisCode + kelasCode + gc + umur;
      }

      let finalKodeSbt = defaultSbtCode;
      if (uniqueSbtMap.has(specificCode)) {
        finalKodeSbt = specificCode;
      } else {
        finalKodeSbt = specificCode || defaultSbtCode;
        missingSbtCodes.add(finalKodeSbt);
      }

      return {
        lokasi: lokasiCode,
        status: status,
        kodeSbt: finalKodeSbt,
        umur: umur,
        groupCost: String(row["GroupCost"] || row["Keterangan_Group_Cost"] || "General").trim(),
        keteranganGroupCost: String(row["Keterangan_Group_Cost"] || "").trim(),
        cost: Number(row["Cost"]) || 0,
        pupuk: pupuk,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Insert missing SBT codes if any
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

  // Insert Lokasi records in batches of 1000
  const BATCH_SIZE = 1000;
  for (let i = 0; i < lokasiDataList.length; i += BATCH_SIZE) {
    const batch = lokasiDataList.slice(i, i + BATCH_SIZE);
    await prisma.lokasi.createMany({
      data: batch,
    });
  }
  console.log(`✅ Seeded ${lokasiDataList.length} Lokasi records.`);

  // 4. Seed Data Aktivitas
  console.log("📄 Reading DataAktivitas.xlsx...");
  const actFile = path.join(dataDir, "DataAktivitas.xlsx");
  const actWb = XLSX.readFile(actFile);
  const actRows = XLSX.utils.sheet_to_json<ExcelRow>(actWb.Sheets[actWb.SheetNames[0]]);

  console.log(`Processing ${actRows.length} records for aktivitas...`);
  const aktivitasDataList = actRows
    .map((row) => {
      const lokasiCode = String(row["Lokasi"] || "").trim();
      if (!msMap.has(lokasiCode)) return null;

      return {
        lokasi: lokasiCode,
        aktivitas: String(row["Aktivitas"] || "").trim(),
        groupCost: String(row["Keterangan Group Cost"] || row["Group"] || "General").trim(),
        keteranganGroupCost: String(row["Keterangan Group Cost"] || "").trim(),
        biaya: Number(row["Biaya"]) || 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  for (let i = 0; i < aktivitasDataList.length; i += BATCH_SIZE) {
    const batch = aktivitasDataList.slice(i, i + BATCH_SIZE);
    await prisma.aktivitas.createMany({
      data: batch,
    });
  }
  console.log(`✅ Seeded ${aktivitasDataList.length} Aktivitas records.`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
