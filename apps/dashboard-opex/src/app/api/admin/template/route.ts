import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "actual").toLowerCase().trim();

    const fileName = category === "budget" ? "template_data_budget.xlsx" : "template_data_actual.xlsx";

    // 1. Cek apakah file template sudah tersimpan di storage
    if (storage.hasTemplateFile(fileName)) {
      const buffer = storage.readTemplateFile(fileName);
      if (buffer) {
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${fileName}"`,
          },
        });
      }
    }

    // 2. Buat template Excel dinamis menggunakan SheetJS jika belum ada
    const wb = XLSX.utils.book_new();

    if (category === "budget") {
      const sampleBudget = [
        {
          costcenter: "CC101",
          deskripsi_costcenter: "Pengolahan Tanah & Persiapan Lahan PG1",
          ce2: "CE01",
          deskripsi_ce2: "Upah & Tenaga Kerja Lapangan",
          amount_idr: 45000000,
          amount_usd: 2850,
          periode: "2026-01",
          bbp: "BBP01",
          group_exp: "OPERATING_EXPENSES",
        },
        {
          costcenter: "CC101",
          deskripsi_costcenter: "Pengolahan Tanah & Persiapan Lahan PG1",
          ce2: "CE02",
          deskripsi_ce2: "Pupuk, Agrokimia & Nutrisi",
          amount_idr: 32000000,
          amount_usd: 2025,
          periode: "2026-01",
          bbp: "BBP01",
          group_exp: "OPERATING_EXPENSES",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleBudget);
      XLSX.utils.book_append_sheet(wb, ws, "Data_Budget");
    } else {
      const sampleActual = [
        {
          costcenter: "CC101",
          deskripsi_costcenter: "Pengolahan Tanah & Persiapan Lahan PG1",
          costelement: "CE01",
          cost_description: "Upah & Tenaga Kerja Lapangan",
          idr_act: 48500000,
          object_currency: "IDR",
          usd_act: 3070,
          notes: "Upah Tenaga Kerja Borongan Penyiangan Gulma Blok A",
          ce2: "CE01",
          deskripsi_ce2: "Upah & Tenaga Kerja Lapangan",
          total_quantity: 120,
          posted_unit_of_meas: "HK",
          document_number: "DOC-2026-001001",
          document_date: "2026-01-10",
          posting_date: "2026-01-12",
          periode: "2026-01",
          pg: "PG1",
          grouping_departement: "AGRONOMI",
          subgrup: "LAND_PREP",
          grup_exp: "OPERATING_EXPENSES",
          jenis_biaya: "DIRECT_LABOR",
          ce_grup: "LABOR",
          grup_aktivitas: "FIELD_OPERATION",
          mapping_biaya: "OPEX_PLANTATION",
        },
        {
          costcenter: "CC101",
          deskripsi_costcenter: "Pengolahan Tanah & Persiapan Lahan PG1",
          costelement: "CE02",
          cost_description: "Pupuk, Agrokimia & Nutrisi",
          idr_act: 28700000,
          object_currency: "IDR",
          usd_act: 1816,
          notes: "Pengadaan Pupuk NPK Granular Dosis Rekomendasi Balit",
          ce2: "CE02",
          deskripsi_ce2: "Pupuk, Agrokimia & Nutrisi",
          total_quantity: 45,
          posted_unit_of_meas: "SAK",
          document_number: "DOC-2026-001002",
          document_date: "2026-01-15",
          posting_date: "2026-01-16",
          periode: "2026-01",
          pg: "PG1",
          grouping_departement: "AGRONOMI",
          subgrup: "FERTILIZING",
          grup_exp: "OPERATING_EXPENSES",
          jenis_biaya: "MATERIAL",
          ce_grup: "AGROCHEMICAL",
          grup_aktivitas: "FIELD_OPERATION",
          mapping_biaya: "OPEX_PLANTATION",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleActual);
      XLSX.utils.book_append_sheet(wb, ws, "Data_Actual");
    }

    const outputBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json({ success: false, message: "Gagal mengunduh template Excel." }, { status: 500 });
  }
}
