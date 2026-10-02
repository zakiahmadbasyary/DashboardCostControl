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
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const lokasi = String(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]) || "").trim();
        const wilayah = String(getVal(row, ["wilayah", "Wilayah", "WILAYAH", "Region"]) || "W01").trim();
        const kodeBibit = String(getVal(row, ["kodeBibit", "kode_bibit", "Kode Bibit", "kodebibit"]) || "").trim();
        const jenisBibit = String(getVal(row, ["jenisBibit", "jenis_bibit", "Jenis Bibit", "jenisbibit"]) || "").trim();
        const kelasBibit = String(getVal(row, ["kelasBibit", "kelas_bibit", "Kelas Bibit", "kelasbibit"]) || "").trim();

        if (lokasi) {
          try {
            await prisma.masterSheet.upsert({
              where: { lokasi },
              update: { wilayah, kodeBibit, jenisBibit, kelasBibit },
              create: { lokasi, wilayah, kodeBibit, jenisBibit, kelasBibit },
            });
            count++;
          } catch (e) {
            console.error(`Row ${i} masterSheet error:`, e);
          }
        }
      }
    } else if (category === "budget") {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdBudget = getVal(row, ["idBudget", "id_budget", "ID Budget", "idbudget"]);
        const idBudget = String(rawIdBudget || `BUD_${String(i + 1).padStart(3, "0")}`).trim();
        const group = String(getVal(row, ["group", "Group", "GROUP", "Group Cost"]) || "ZN01").trim();
        const status = String(getVal(row, ["status", "Status", "STATUS", "Status Lokasi"]) || "NSSC").trim();
        const periode = parseNum(getVal(row, ["periode", "Periode", "PERIODE", "Bulan"]), 1);
        const budget = parseNum(getVal(row, ["budget", "Budget", "BUDGET", "Anggaran", "Total Budget"]), 0);

        if (idBudget) {
          try {
            await prisma.budget.upsert({
              where: { idBudget },
              update: { group, status, periode: Math.round(periode), budget },
              create: { idBudget, group, status, periode: Math.round(periode), budget },
            });
            count++;
          } catch (e) {
            console.error(`Row ${i} budget error:`, e);
          }
        }
      }
    } else if (category === "lokasi") {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rawIdLokasiHpp = getVal(row, ["idLokasiHpp", "id_lokasi_hpp", "ID Lokasi HPP", "idlokasihpp"]);
        const lokasi = String(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]) || "").trim();
        const idLokasiHpp = String(rawIdLokasiHpp || `LH_${lokasi || i + 1}_${i + 1}`).trim();
        const idBudget = String(getVal(row, ["idBudget", "id_budget", "ID Budget", "idbudget"]) || "").trim();
        const periode = parseNum(getVal(row, ["periode", "Periode", "PERIODE", "Bulan"]), 1);
        const status = String(getVal(row, ["status", "Status", "STATUS"]) || "NSSC").trim();
        const qtyPanen = parseNum(getVal(row, ["qtyPanen", "qty_panen", "Qty Panen", "Hasil Panen"]), 0);
        const luasPanen = parseNum(getVal(row, ["luasPanen", "luas_panen", "Luas Panen"]), 0);
        const luasAktif = parseNum(getVal(row, ["luasAktif", "luas_aktif", "Luas Aktif"]), luasPanen);
        const group = String(getVal(row, ["group", "Group", "GROUP"]) || "ZN01").trim();
        const descGroup = String(getVal(row, ["descGroup", "desc_group", "Desc Group", "Keterangan Group"]) || `Group ${group}`).trim();
        const jenisBiaya = String(getVal(row, ["jenisBiaya", "jenis_biaya", "Jenis Biaya", "Kategori Biaya"]) || "Umum").trim();
        const biaya = parseNum(getVal(row, ["biaya", "Biaya", "BIAYA", "Total Biaya"]), 0);

        if (lokasi) {
          try {
            // 1. Auto-create masterSheet record if it doesn't exist yet
            await prisma.masterSheet.upsert({
              where: { lokasi },
              update: {},
              create: {
                lokasi,
                wilayah: "W01",
                kodeBibit: "-",
                jenisBibit: "-",
                kelasBibit: "-",
              },
            });

            // 2. Auto-resolve or create budget record
            let targetIdBudget = idBudget;
            if (!targetIdBudget) {
              const matchedBudget = await prisma.budget.findFirst({
                where: { periode: Math.round(periode), group, status },
              });
              if (matchedBudget) {
                targetIdBudget = matchedBudget.idBudget;
              } else {
                targetIdBudget = `BUD_AUTO_${group}_${status}_P${Math.round(periode)}`;
                await prisma.budget.upsert({
                  where: { idBudget: targetIdBudget },
                  update: {},
                  create: {
                    idBudget: targetIdBudget,
                    group,
                    status,
                    periode: Math.round(periode),
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
                    group,
                    status,
                    periode: Math.round(periode),
                    budget: 0,
                  },
                });
              }
            }

            await prisma.lokasiHPP.upsert({
              where: { idLokasiHpp },
              update: { lokasi, idBudget: targetIdBudget, periode: Math.round(periode), status, qtyPanen, luasPanen, luasAktif, group, descGroup, jenisBiaya, biaya },
              create: { idLokasiHpp, lokasi, idBudget: targetIdBudget, periode: Math.round(periode), status, qtyPanen, luasPanen, luasAktif, group, descGroup, jenisBiaya, biaya },
            });
            count++;
          } catch (e) {
            console.error(`Row ${i} lokasiHPP error:`, e);
          }
        }
      }
    } else if (category === "aktivitas") {
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
        const lokasi = String(getVal(row, ["lokasi", "Lokasi", "LOKASI", "Kode Lokasi"]) || "").trim();
        const idAktivitas = String(rawIdAktivitas || `ACT_${lokasi || i + 1}_${i + 1}`).trim();
        const aktivitas = String(getVal(row, ["aktivitas", "Aktivitas", "Nama Aktivitas", "Pekerjaan"]) || "Aktivitas").trim();
        const biaya = parseNum(getVal(row, ["biaya", "Biaya", "BIAYA"]), 0);
        const hasil = parseNum(getVal(row, ["hasil", "Hasil", "HASIL"]), 0);
        const uom = String(getVal(row, ["uom", "UoM", "UOM", "Satuan"]) || "Kg").trim();
        const group = String(getVal(row, ["group", "Group", "GROUP"]) || "ZN01").trim();

        const tanggalMulaiRawat = parseDate(getVal(row, ["tanggalMulaiRawat", "tanggal_mulai_rawat", "Tanggal Mulai Rawat"]));
        const tanggalMulaiTanam = parseDate(getVal(row, ["tanggalMulaiTanam", "tanggal_mulai_tanam", "Tanggal Mulai Tanam"]));
        const tanggalForcingStandard = parseDate(getVal(row, ["tanggalForcingStandard", "tanggal_forcing_standard", "Tanggal Forcing Standard"]));
        const rencanaForcing = parseDate(getVal(row, ["rencanaForcing", "rencana_forcing", "Rencana Forcing"]));
        const realForcing = parseDate(getVal(row, ["realForcing", "real_forcing", "Real Forcing"]));
        const rencanaPanen = parseDate(getVal(row, ["rencanaPanen", "rencana_panen", "Rencana Panen"]));

        if (lokasi) {
          try {
            await prisma.masterSheet.upsert({
              where: { lokasi },
              update: {},
              create: {
                lokasi,
                wilayah: "W01",
                kodeBibit: "-",
                jenisBibit: "-",
                kelasBibit: "-",
              },
            });

            await prisma.aktivitasHPP.upsert({
              where: { idAktivitas },
              update: {
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
              },
              create: {
                lokasi,
                aktivitas,
                biaya,
                hasil,
                uom,
                group,
                idAktivitas,
                tanggalMulaiRawat,
                tanggalMulaiTanam,
                tanggalForcingStandard,
                rencanaForcing,
                realForcing,
                rencanaPanen,
              },
            });
            count++;
          } catch (e) {
            console.error(`Row ${i} aktivitasHPP error:`, e);
          }
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
