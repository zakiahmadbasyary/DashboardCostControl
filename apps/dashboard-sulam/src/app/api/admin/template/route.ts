import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const fileName = "template_data_sulam.xlsx";

    const wb = XLSX.utils.book_new();

    const sampleData = [
      {
        tanggal_realisasi: "2026-01-15",
        spk_id: "SPK-PG1-2026-001",
        plantation_group: "PG1",
        wilayah: "AW01",
        lokasi: "101A",
        status_tanaman: "Planted",
        tanggal_spk: "2026-01-10",
        kode_aktivitas: "SLM-01",
        deskripsi: "Penyulaman Tanaman Tahap 1 Blok 101A",
        jenis_data: "Upah",
        group_bahan_alat: "Tenaga Kerja Sulam",
        kode_bahan_alat_lainlain: "TK-SLM",
        deskripsi_bahan_alat_lainlain: "Tenaga Kerja Borongan Sulam",
        resource_bahan_alat: 12.5, // Jumlah TK
        hasil_efektif: 3.5, // Luas HA
        satuan_hasil: "HA",
        total_realisasi_biaya: 1850000, // Biaya Upah Rp
        referensi_lokasi: "PG1-AW01-101A",
        cost_center_name: "Agronomi PG1",
        cost_working_hour: 7.0,
        indeks_biaya: 528571.43,
        index_resource_qty: 3.57,
        pas_document: "PAS-2026-01-001",
        order_no: "ORD-2026-01-001",
        act_cost_group: "LABOR_SULAM",
      },
      {
        tanggal_realisasi: "2026-01-16",
        spk_id: "SPK-PG1-2026-002",
        plantation_group: "PG1",
        wilayah: "AW01",
        lokasi: "101A",
        status_tanaman: "Planted",
        tanggal_spk: "2026-01-10",
        kode_aktivitas: "SLM-02",
        deskripsi: "Pengadaan Bibit Sulam Blok 101A",
        jenis_data: "Material",
        group_bahan_alat: "Bibit Nanas",
        kode_bahan_alat_lainlain: "BBT-NNS-01",
        deskripsi_bahan_alat_lainlain: "Bibit Nanas Mahkota Standar",
        resource_bahan_alat: 2500, // Jumlah Batang
        hasil_efektif: 3.5, // Luas HA
        satuan_hasil: "HA",
        total_realisasi_biaya: 3750000, // Biaya Material Rp
        referensi_lokasi: "PG1-AW01-101A",
        cost_center_name: "Agronomi PG1",
        cost_working_hour: 0,
        indeks_biaya: 1071428.57,
        index_resource_qty: 714.29,
        pas_document: "PAS-2026-01-002",
        order_no: "ORD-2026-01-002",
        act_cost_group: "MATERIAL_SULAM",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Data_Sulam");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Gagal membuat template Sulam:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat template Excel Sulam." },
      { status: 500 }
    );
  }
}

