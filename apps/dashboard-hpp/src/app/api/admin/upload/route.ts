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
      await prisma.masterSheet.deleteMany();
      const uniqueMap = new Map<string, { lokasi: string; wilayah: string; kodeBibit: string; jenisBibit: string; kelasBibit: string }>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        const wilayah = limitStr(getVal(row, ["wilayah", "Wilayah", "WILAYAH", "Region"]), 10, "W01");
        const kodeBibit = limitStr(getVal(row, ["kodeBibit", "kode_bibit", "Kode Bibit", "kodebibit"]), 20, "-");
        const jenisBibit = limitStr(getVal(row, ["jenisBibit", "jenis_bibit", "Jenis Bibit", "jenisbibit"]), 20, "-");
        const kelasBibit = limitStr(getVal(row, ["kelasBibit", "kelas_bibit", "Kelas Bibit", "kelasbibit"]), 20, "-");

        if (lokasi) {
          uniqueMap.set(lokasi, { lokasi, wilayah, kodeBibit, jenisBibit, kelasBibit });
        }
      }

      for (const item of Array.from(uniqueMap.values())) {
        try {
          await prisma.masterSheet.create({ data: item });
          count++;
        } catch (e) {
          console.error(`masterSheet error for ${item.lokasi}:`, e);
        }
      }
    } else if (category === "budget") {
      await prisma.budget.deleteMany();
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
          await prisma.budget.create({ data: item });
          count++;
        } catch (e) {
          console.error(`budget error for ${item.idBudget}:`, e);
        }
      }
    } else if (category === "lokasi") {
      await prisma.lokasiHPP.deleteMany();
      const uniqueMap = new Map<string, any>();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdLokasiHpp = getVal(row, ["idLokasiHpp", "id_lokasi_hpp", "ID Lokasi HPP", "idlokasihpp"]);
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        const periode = Math.round(parseNum(getVal(row, ["periode", "Periode", "PERIODE", "Bulan"]), 1));
        const status = limitStr(getVal(row, ["status", "Status", "STATUS"]), 10, "NSSC");
        const group = limitStr(getVal(row, ["group", "Group", "GROUP"]), 10, "ZN01");
        const descGroup = limitStr(getVal(row, ["descGroup", "desc_group", "Desc Group", "Keterangan Group"]), 255, `Group ${group}`);

        const fallbackIdHpp = `LH_${lokasi}_P${periode}_${i + 1}`;
        const idLokasiHpp = limitStr(rawIdLokasiHpp || fallbackIdHpp, 20);
        const idBudget = limitStr(getVal(row, ["idBudget", "id_budget", "ID Budget", "idbudget"]), 20);
        const qtyPanen = parseNum(getVal(row, ["qtyPanen", "qty_panen", "Qty Panen", "Hasil Panen"]), 0);
        const luasPanen = parseNum(getVal(row, ["luasPanen", "luas_panen", "Luas Panen"]), 0);
        const luasAktif = parseNum(getVal(row, ["luasAktif", "luas_aktif", "Luas Aktif"]), luasPanen);
        const jenisBiaya = limitStr(getVal(row, ["jenisBiaya", "jenis_biaya", "Jenis Biaya", "Kategori Biaya"]), 50, "Umum");
        const biaya = parseNum(getVal(row, ["biaya", "Biaya", "BIAYA", "Total Biaya"]), 0);

        if (lokasi) {
          uniqueMap.set(idLokasiHpp, {
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
          });
        }
      }

      for (const item of Array.from(uniqueMap.values())) {
        try {
          // 1. Auto-create masterSheet record if it doesn't exist yet
          await prisma.masterSheet.upsert({
            where: { lokasi: item.lokasi },
            update: {},
            create: {
              lokasi: item.lokasi,
              wilayah: "W01",
              kodeBibit: "-",
              jenisBibit: "-",
              kelasBibit: "-",
            },
          });

          // 2. Auto-resolve or create budget record
          let targetIdBudget = item.idBudget;
          if (!targetIdBudget) {
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
              lokasi: item.lokasi,
              idBudget: targetIdBudget,
              periode: item.periode,
              status: item.status,
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
          console.error(`lokasiHPP error for ${item.idLokasiHpp}:`, e);
        }
      }
    } else if (category === "aktivitas") {
      await prisma.aktivitasHPP.deleteMany();
      const uniqueMap = new Map<string, any>();

      const parseDate = (val: any): Date | null => {
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
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdAktivitas = getVal(row, ["idAktivitas", "id_aktivitas", "ID Aktivitas", "idaktivitas"]);
        const lokasi = limitStr(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]), 10);
        const fallbackIdAct = `ACT_${lokasi}_${i + 1}`;
        const idAktivitas = limitStr(rawIdAktivitas || fallbackIdAct, 20);
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

        if (lokasi) {
          uniqueMap.set(idAktivitas, {
            idAktivitas,
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
      }

      for (const item of Array.from(uniqueMap.values())) {
        try {
          await prisma.masterSheet.upsert({
            where: { lokasi: item.lokasi },
            update: {},
            create: {
              lokasi: item.lokasi,
              wilayah: "W01",
              kodeBibit: "-",
              jenisBibit: "-",
              kelasBibit: "-",
            },
          });

          await prisma.aktivitasHPP.create({ data: item });
          count++;
        } catch (e) {
          console.error(`aktivitasHPP error for ${item.idAktivitas}:`, e);
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Berhasil mengunggah & menyimpan ${count} baris data ${category} ke database PostgreSQL.`,
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
