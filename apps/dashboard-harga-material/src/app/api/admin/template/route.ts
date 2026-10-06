import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const templateData = [
      {
        "Kode Material": "MAT-PUPUK-01",
        "Material Description": "PUPUK NPK 15-15-15 PG1",
        "Group": "PUPUK",
        "Satuan": "KG",
        "ABC Indicator": "A",
        "Harga": 15000,
        "Currency": "IDR",
        "Price Unit": 1,
        "Material Group": "PUPUK",
        "Plant": "1000",
        "Purchasing Group": "P01",
        "Last Change": "2026-01-10",
        "Created By": "ADMIN01",
        "Tanggal Update": "2026-01-15",
      },
      {
        "Kode Material": "MAT-PUPUK-01",
        "Material Description": "PUPUK NPK 15-15-15 PG1",
        "Group": "PUPUK",
        "Satuan": "KG",
        "ABC Indicator": "A",
        "Harga": 15500,
        "Currency": "IDR",
        "Price Unit": 1,
        "Material Group": "PUPUK",
        "Plant": "1000",
        "Purchasing Group": "P01",
        "Last Change": "2026-02-10",
        "Created By": "ADMIN01",
        "Tanggal Update": "2026-02-15",
      },
      {
        "Kode Material": "MAT-HERBI-02",
        "Material Description": "HERBISIDA GLIFOSAT 480 SL",
        "Group": "PESTISIDA",
        "Satuan": "LITER",
        "ABC Indicator": "B",
        "Harga": 65000,
        "Currency": "IDR",
        "Price Unit": 1,
        "Material Group": "PESTISIDA",
        "Plant": "2000",
        "Purchasing Group": "P02",
        "Last Change": "2026-01-12",
        "Created By": "ADMIN02",
        "Tanggal Update": "2026-01-20",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataHargaMaterial");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="DataHargaMaterial_Template.xlsx"',
      },
    });
  } catch (error: unknown) {
    console.error("Error generating template:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat template Excel." }, { status: 500 });
  }
}
