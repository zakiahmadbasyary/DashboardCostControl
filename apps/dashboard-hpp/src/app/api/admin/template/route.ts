import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "mastersheet";

    let sampleData: any[] = [];
    let filename = "template.xlsx";

    if (category === "mastersheet") {
      filename = "template_mastersheet_hpp.xlsx";
      sampleData = [
        { lokasi: "001A", wilayah: "W01", kodeBibit: "BIB-S01", jenisBibit: "sucker", kelasBibit: "sedang" },
        { lokasi: "002A", wilayah: "W02", kodeBibit: "BIB-[#001]", jenisBibit: "nursery", kelasBibit: "kecil" },
        { lokasi: "003A", wilayah: "W03", kodeBibit: "BIB-C01", jenisBibit: "crown", kelasBibit: "besar" },
      ];
    } else if (category === "budget") {
      filename = "template_budget_hpp.xlsx";
      sampleData = [
        { idBudget: "BUD001", group: "ZN01", status: "NFSC", periode: 1, budget: 500000000 },
        { idBudget: "BUD002", group: "ZN02", status: "NSSC", periode: 2, budget: 750000000 },
      ];
    } else if (category === "lokasi") {
      filename = "template_lokasi_hpp.xlsx";
      sampleData = [
        {
          idLokasiHpp: "LH001",
          lokasi: "001A",
          idBudget: "BUD001",
          periode: 1,
          status: "NFSC",
          qtyPanen: 12500,
          luasPanen: 5.2,
          luasAktif: 5.5,
          group: "ZN01",
          descGroup: "Land Preparation & Maintenance",
          jenisBiaya: "Pupuk & Kimia",
          biaya: 150000000,
        },
      ];
    } else if (category === "aktivitas") {
      filename = "template_aktivitas_hpp.xlsx";
      sampleData = [
        {
          idAktivitas: "ACT001",
          lokasi: "001A",
          tanggalMulaiRawat: "2026-01-10",
          tanggalMulaiTanam: "2026-02-01",
          tanggalForcingStandard: "2026-06-15",
          rencanaForcing: "2026-06-20",
          realForcing: "2026-06-22",
          rencanaPanen: "2026-11-01",
          aktivitas: "Pemupukan Dosis 1",
          biaya: 35000000,
          hasil: 12500,
          UoM: "Kg",
          group: "ZN01",
        },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating Excel template:", error);
    return NextResponse.json({ status: "error", message: "Gagal membuat template Excel." }, { status: 500 });
  }
}
