import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Safe number parser (handles string numbers with dots/commas/currency symbols e.g. "Rp 450.000.000" or 450000000)
function parseNum(val: any, defaultVal = 0): number {
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;
  if (!val) return defaultVal;

  let str = String(val).trim();
  if (!str) return defaultVal;

  // Remove currency prefix / letters
  str = str.replace(/[^0-9.,-]/g, "");

  // If Indonesian format with dot separators e.g. 450.000.000, remove dots
  if (str.includes(".") && !str.includes(",")) {
    const parts = str.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, "");
    }
  } else if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",") && !str.includes(".")) {
    str = str.replace(",", ".");
  }

  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

// Case-insensitive key lookup from Excel row object
function getVal(row: Record<string, any>, possibleKeys: string[]): any {
  if (!row || typeof row !== "object") return undefined;

  const normalizedRowKeys: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    normalizedRowKeys[cleanKey] = row[k];
  }

  for (const targetKey of possibleKeys) {
    const cleanTarget = targetKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedRowKeys[cleanTarget] !== undefined && normalizedRowKeys[cleanTarget] !== null) {
      return normalizedRowKeys[cleanTarget];
    }
  }
  return undefined;
}

// String sanitizer to prevent PostgreSQL VarChar length overflow crashes
function limitStr(val: any, maxLen: number, defaultVal = ""): string {
  if (val === null || val === undefined) return defaultVal.substring(0, maxLen);
  const s = String(val).trim();
  const res = s || defaultVal;
  return res.substring(0, maxLen);
}

// Date parser helper
function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "number") {
    const d = new Date(Math.round((val - (25567 + 2)) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Data Excel kosong atau tidak terbaca." },
        { status: 400 }
      );
    }

    let count = 0;

    if (category === "mastersheet") {
      const uniqueMap = new Map<string, any>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        const wilayah = limitStr(getVal(row, ["wilayah", "Wilayah", "WILAYAH", "Region"]), 10, "W01");
        const jenisBibit = limitStr(getVal(row, ["jenisBibit", "jenis_bibit", "Jenis Bibit", "jenisbibit"]), 20, "-");
        const kelasBibit = limitStr(getVal(row, ["kelasBibit", "kelas_bibit", "Kelas Bibit", "kelasbibit"]), 20, "-");
        const status = limitStr(getVal(row, ["status", "Status", "STATUS"]), 10, "NSSC");

        const tanggalRawat = parseDate(getVal(row, ["tanggalRawat", "tanggal_rawat", "Tanggal Rawat", "Tgl Rawat"])) || new Date();
        const tanggalTanam = parseDate(getVal(row, ["tanggalTanam", "tanggal_tanam", "Tanggal Tanam"]));
        const tanggalForcingStandard = parseDate(getVal(row, ["tanggalForcingStandard", "tanggal_forcing_standard", "Tanggal Forcing Standard"]));
        const tanggalRenForcing = parseDate(getVal(row, ["tanggalRenForcing", "tanggal_ren_forcing", "Rencana Forcing"]));
        const tanggalRealForcing = parseDate(getVal(row, ["tanggalRealForcing", "tanggal_real_forcing", "Real Forcing", "Realisasi Forcing"]));
        const tanggalSelesaiPanen = parseDate(getVal(row, ["tanggalSelesaiPanen", "tanggal_selesai_panen", "Selesai Panen", "Tanggal Selesai Panen", "Rencana Panen"]));

        const rawatStr = tanggalRawat.toISOString().split("T")[0];
        const rawIdMaster = getVal(row, ["idMaster", "id_master", "ID Master"]);
        const idMaster = limitStr(rawIdMaster || `${lokasi}_${rawatStr}`, 50);

        if (idMaster && lokasi) {
          uniqueMap.set(idMaster, {
            idMaster,
            lokasi,
            wilayah,
            jenisBibit,
            kelasBibit,
            status,
            tanggalRawat,
            tanggalTanam,
            tanggalForcingStandard,
            tanggalRenForcing,
            tanggalRealForcing,
            tanggalSelesaiPanen,
          });
        }
      }

      for (const item of Array.from(uniqueMap.values())) {
        try {
          await prisma.masterSheet.upsert({
            where: { idMaster: item.idMaster },
            update: {
              lokasi: item.lokasi,
              wilayah: item.wilayah,
              jenisBibit: item.jenisBibit,
              kelasBibit: item.kelasBibit,
              status: item.status,
              tanggalRawat: item.tanggalRawat,
              tanggalTanam: item.tanggalTanam,
              tanggalForcingStandard: item.tanggalForcingStandard,
              tanggalRenForcing: item.tanggalRenForcing,
              tanggalRealForcing: item.tanggalRealForcing,
              tanggalSelesaiPanen: item.tanggalSelesaiPanen,
            },
            create: item,
          });
          count++;
        } catch (e) {
          console.error(`masterSheet upsert error for ${item.idMaster}:`, e);
        }
      }
    } else if (category === "budget") {
      const uniqueMap = new Map<string, { idBudget: string; group: string; status: string; periode: number; budget: number }>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdBudget = getVal(row, ["idBudget", "id_budget", "ID Budget", "idbudget"]);
        const group = limitStr(getVal(row, ["group", "Group", "GROUP", "Group Cost"]), 10, "ZN01");
        const status = limitStr(getVal(row, ["status", "Status", "STATUS", "Status Lokasi"]), 10, "NSSC");
        const periode = Math.round(parseNum(getVal(row, ["periode", "Periode", "PERIODE", "Bulan"]), 1));
        const budget = parseNum(getVal(row, ["budget", "Budget", "BUDGET", "Anggaran", "Total Budget"]), 0);

        const fallbackId = `B_${group}_${status}_P${periode}`;
        const idBudget = limitStr(rawIdBudget || fallbackId, 20);

        if (idBudget) {
          uniqueMap.set(idBudget, { idBudget, group, status, periode, budget });
        }
      }

      for (const item of Array.from(uniqueMap.values())) {
        try {
          await prisma.budget.upsert({
            where: { idBudget: item.idBudget },
            update: {
              group: item.group,
              status: item.status,
              periode: item.periode,
              budget: item.budget,
            },
            create: item,
          });
          count++;
        } catch (e) {
          console.error(`budget upsert error for ${item.idBudget}:`, e);
        }
      }
    } else if (category === "lokasi") {
      // 1. Prepare items to insert
      const itemsToInsert: any[] = [];
      const timeKey = Date.now().toString(36);

      // Check existing IDs to avoid duplicate key conflict if user supplied existing ID
      const providedIds: string[] = [];
      for (let i = 0; i < data.length; i++) {
        const rawId = getVal(data[i], ["idLokasiHpp", "id_lokasi_hpp", "ID Lokasi HPP", "idlokasihpp"]);
        if (rawId) providedIds.push(limitStr(rawId, 20));
      }

      const existingIdSet = new Set<string>();
      if (providedIds.length > 0) {
        const existing = await prisma.lokasiHPP.findMany({
          where: { idLokasiHpp: { in: providedIds } },
          select: { idLokasiHpp: true },
        });
        existing.forEach((r) => existingIdSet.add(r.idLokasiHpp));
      }

      const masterSheetsNeeded = new Map<string, any>();
      const budgetCache = new Map<string, string>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdLokasiHpp = getVal(row, ["idLokasiHpp", "id_lokasi_hpp", "ID Lokasi HPP", "idlokasihpp"]);
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        if (!lokasi) continue;

        const periode = Math.round(parseNum(getVal(row, ["periode", "Periode", "PERIODE", "Bulan"]), 1));
        const tahun = Math.round(parseNum(getVal(row, ["tahun", "Tahun", "TAHUN"]), new Date().getFullYear()));
        const tanggalRawat = parseDate(getVal(row, ["tanggalRawat", "tanggal_rawat", "Tanggal Rawat"])) || new Date();
        const rawatStr = tanggalRawat.toISOString().split("T")[0];

        const rawIdMaster = getVal(row, ["idMaster", "id_master", "ID Master"]);
        const idMaster = limitStr(rawIdMaster || `${lokasi}_${rawatStr}`, 50);

        const status = limitStr(getVal(row, ["status", "Status", "STATUS"]), 10, "NSSC");
        const jenisBibit = limitStr(getVal(row, ["jenisBibit", "jenis_bibit", "Jenis Bibit", "jenisbibit"]), 20, "-");
        const kelasBibit = limitStr(getVal(row, ["kelasBibit", "kelas_bibit", "Kelas Bibit", "kelasbibit"]), 20, "-");
        const group = limitStr(getVal(row, ["group", "Group", "GROUP"]), 10, "ZN01");
        const descGroup = limitStr(getVal(row, ["descGroup", "desc_group", "Desc Group", "Keterangan Group"]), 255, `Group ${group}`);

        // Generate unique idLokasiHpp (Max 20 chars, e.g. "LH_m8c8k1a_1_3f")
        let idLokasiHpp = rawIdLokasiHpp ? limitStr(rawIdLokasiHpp, 20) : "";
        if (!idLokasiHpp || existingIdSet.has(idLokasiHpp)) {
          const randHex = Math.random().toString(36).substring(2, 5);
          idLokasiHpp = `LH_${timeKey}_${(i + 1).toString(36)}_${randHex}`.substring(0, 20);
        }
        existingIdSet.add(idLokasiHpp);

        const idBudget = limitStr(getVal(row, ["idBudget", "id_budget", "ID Budget", "idbudget"]), 20);
        const qtyPanen = parseNum(getVal(row, ["qtyPanen", "qty_panen", "Qty Panen", "Hasil Panen"]), 0);
        const luasPanen = parseNum(getVal(row, ["luasPanen", "luas_panen", "Luas Panen"]), 0);
        const luasAktif = parseNum(getVal(row, ["luasAktif", "luas_aktif", "Luas Aktif"]), luasPanen);
        const jenisBiaya = limitStr(getVal(row, ["jenisBiaya", "jenis_biaya", "Jenis Biaya", "Kategori Biaya"]), 50, "Umum");
        const biaya = parseNum(getVal(row, ["biaya", "Biaya", "BIAYA", "Total Biaya"]), 0);

        if (idMaster) {
          masterSheetsNeeded.set(idMaster, {
            idMaster,
            lokasi,
            wilayah: "W01",
            jenisBibit: jenisBibit || "-",
            kelasBibit: kelasBibit || "-",
            status: status || "NSSC",
            tanggalRawat,
          });
        }

        itemsToInsert.push({
          idLokasiHpp,
          idMaster,
          lokasi,
          idBudget,
          periode,
          tahun,
          tanggalRawat,
          status,
          jenisBibit,
          kelasBibit,
          qtyPanen,
          luasPanen,
          luasAktif,
          group,
          descGroup,
          jenisBiaya,
          biaya,
        });
      }

      // Auto-upsert needed MasterSheet records so foreign key constraint is satisfied
      for (const ms of Array.from(masterSheetsNeeded.values())) {
        try {
          await prisma.masterSheet.upsert({
            where: { idMaster: ms.idMaster },
            update: {},
            create: ms,
          });
        } catch (e) {
          console.error(`MasterSheet auto-create error for ${ms.idMaster}:`, e);
        }
      }

      // Insert each location row with resolved budget
      for (const item of itemsToInsert) {
        try {
          let targetIdBudget = item.idBudget;
          const budgetKey = `${item.periode}_${item.group}_${item.status}`;

          if (!targetIdBudget) {
            if (budgetCache.has(budgetKey)) {
              targetIdBudget = budgetCache.get(budgetKey)!;
            } else {
              const matchedBudget = await prisma.budget.findFirst({
                where: { periode: item.periode, group: item.group, status: item.status },
              });
              if (matchedBudget) {
                targetIdBudget = matchedBudget.idBudget;
              } else {
                targetIdBudget = limitStr(`B_AUTO_${item.group}_${item.status}_P${item.periode}`, 20);
                await prisma.budget.upsert({
                  where: { idBudget: targetIdBudget },
                  update: {},
                  create: {
                    idBudget: targetIdBudget,
                    group: item.group,
                    status: item.status,
                    periode: item.periode,
                    budget: 0,
                  },
                });
              }
              budgetCache.set(budgetKey, targetIdBudget);
            }
          } else {
            const existBudget = await prisma.budget.findUnique({
              where: { idBudget: targetIdBudget },
            });
            if (!existBudget) {
              await prisma.budget.create({
                data: {
                  idBudget: targetIdBudget,
                  group: item.group,
                  status: item.status,
                  periode: item.periode,
                  budget: 0,
                },
              });
            }
          }

          await prisma.lokasiHPP.create({
            data: {
              idLokasiHpp: item.idLokasiHpp,
              idMaster: item.idMaster,
              lokasi: item.lokasi,
              idBudget: targetIdBudget,
              periode: item.periode,
              tahun: item.tahun,
              tanggalRawat: item.tanggalRawat,
              status: item.status,
              jenisBibit: item.jenisBibit,
              kelasBibit: item.kelasBibit,
              qtyPanen: item.qtyPanen,
              luasPanen: item.luasPanen,
              luasAktif: item.luasAktif,
              group: item.group,
              descGroup: item.descGroup,
              jenisBiaya: item.jenisBiaya,
              biaya: item.biaya,
            },
          });
          count++;
        } catch (e) {
          console.error(`lokasiHPP insert error for ${item.idLokasiHpp}:`, e);
        }
      }
    } else if (category === "aktivitas") {
      const itemsToInsert: any[] = [];
      const timeKey = Date.now().toString(36);

      const providedIds: string[] = [];
      for (let i = 0; i < data.length; i++) {
        const rawId = getVal(data[i], ["idAktivitas", "id_aktivitas", "ID Aktivitas", "idaktivitas"]);
        if (rawId) providedIds.push(limitStr(rawId, 20));
      }

      const existingIdSet = new Set<string>();
      if (providedIds.length > 0) {
        const existing = await prisma.aktivitasHPP.findMany({
          where: { idAktivitas: { in: providedIds } },
          select: { idAktivitas: true },
        });
        existing.forEach((r) => existingIdSet.add(r.idAktivitas));
      }

      const masterSheetsNeeded = new Map<string, any>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdAktivitas = getVal(row, ["idAktivitas", "id_aktivitas", "ID Aktivitas", "idaktivitas"]);
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        if (!lokasi) continue;

        let idAktivitas = rawIdAktivitas ? limitStr(rawIdAktivitas, 20) : "";
        if (!idAktivitas || existingIdSet.has(idAktivitas)) {
          const randHex = Math.random().toString(36).substring(2, 5);
          idAktivitas = `AC_${timeKey}_${(i + 1).toString(36)}_${randHex}`.substring(0, 20);
        }
        existingIdSet.add(idAktivitas);

        const aktivitas = limitStr(getVal(row, ["aktivitas", "Aktivitas", "Nama Aktivitas", "Pekerjaan"]), 100, "Aktivitas");
        const biaya = parseNum(getVal(row, ["biaya", "Biaya", "BIAYA"]), 0);
        const hasil = parseNum(getVal(row, ["hasil", "Hasil", "HASIL"]), 0);
        const uom = limitStr(getVal(row, ["uom", "UoM", "UOM", "Satuan"]), 20, "Kg");
        const group = limitStr(getVal(row, ["group", "Group", "GROUP"]), 10, "ZN01");

        const tanggalMulaiRawat = parseDate(getVal(row, ["tanggalMulaiRawat", "tanggal_mulai_rawat", "Tanggal Mulai Rawat"]));
        const tanggalMulaiTanam = parseDate(getVal(row, ["tanggalMulaiTanam", "tanggal_mulai_tanam", "Tanggal Mulai Tanam"]));
        const tanggalForcingStandard = parseDate(getVal(row, ["tanggalForcingStandard", "tanggal_forcing_standard", "Tanggal Forcing Standard"]));
        const rencanaForcing = parseDate(getVal(row, ["rencanaForcing", "rencana_forcing", "Rencana Forcing"]));
        const realForcing = parseDate(getVal(row, ["realForcing", "real_forcing", "Real Forcing"]));
        const rencanaPanen = parseDate(getVal(row, ["rencanaPanen", "rencana_panen", "Rencana Panen"]));

        const rawatStr = (tanggalMulaiRawat || new Date()).toISOString().split("T")[0];
        const rawIdMaster = getVal(row, ["idMaster", "id_master", "ID Master"]);
        const idMaster = limitStr(rawIdMaster || `${lokasi}_${rawatStr}`, 50);

        if (idMaster) {
          masterSheetsNeeded.set(idMaster, {
            idMaster,
            lokasi,
            wilayah: "W01",
            jenisBibit: "-",
            kelasBibit: "-",
            status: "NSSC",
            tanggalRawat: tanggalMulaiRawat || new Date(),
          });
        }

        itemsToInsert.push({
          idAktivitas,
          idMaster,
          lokasi,
          aktivitas,
          biaya,
          hasil,
          uom,
          group,
          tanggalMulaiRawat,
          tanggalMulaiTanam,
          tanggalForcingStandard,
          rencanaForcing,
          realForcing,
          rencanaPanen,
        });
      }

      // Auto-upsert needed MasterSheet records
      for (const ms of Array.from(masterSheetsNeeded.values())) {
        try {
          await prisma.masterSheet.upsert({
            where: { idMaster: ms.idMaster },
            update: {},
            create: ms,
          });
        } catch (e) {
          console.error(`MasterSheet auto-create error for ${ms.idMaster}:`, e);
        }
      }

      // Insert each activity row
      for (const item of itemsToInsert) {
        try {
          await prisma.aktivitasHPP.create({ data: item });
          count++;
        } catch (e) {
          console.error(`aktivitasHPP insert error for ${item.idAktivitas}:`, e);
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Berhasil memproses & menambahkan/memperbarui ${count} baris data ${category} di database PostgreSQL.`,
      count,
    });
  } catch (error: any) {
    console.error("Error uploading Excel data:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal menyimpan data Excel ke database." },
      { status: 400 }
    );
  }
}
