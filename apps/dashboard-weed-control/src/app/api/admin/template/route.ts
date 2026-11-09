import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "lokasi";

    let sheetData: Record<string, any>[] = [];
    let fileName = "template_weed_control_lokasi.xlsx";

    if (category === "lokasi") {
      fileName = "template_weed_control_data_lokasi.xlsx";
      sheetData = [
        {
          Lokasi: "AW0101",
          Status: "Nanas",
          Wilayah: "AW01",
          Luas: "12,14",
          Jenis: "Smooth Cayenne",
          Kelas: "A",
          Mulai_Rawat: "01/01/2024",
          Mulai_Tanam: "15/01/2024",
          Forcing_Standar: "01/10/2024",
          Real_Forcing: "05/10/2024",
          Selesai_Panen: "15/05/2025",
          Umur_Forcing: 9,
          Umur: 12,
          Total_Cost: "125.000.000",
          "Umur 1": "10.000.000",
          "Umur 2": "12.500.000",
          "Umur 3": "8.000.000",
          "Umur 4": "0",
          "Umur 5": "-",
          "Umur 6": "-",
          "Umur 7": "-",
          "Umur 8": "-",
          "Umur 9": "-",
          "Umur 10": "-",
          "Umur 11": "-",
          "Umur 12": "-",
          "Umur 13": "-",
          "Umur 14": "-",
          "Umur 15": "-",
          "Umur 16": "-",
          "Umur 17": "-",
          "Umur 18": "-",
          "Umur 19": "-",
          "Umur 20": "-",
        },
        {
          Lokasi: "AW0102",
          Status: "Nanas",
          Wilayah: "AW01",
          Luas: "8,50",
          Jenis: "MD2",
          Kelas: "B",
          Mulai_Rawat: "10/02/2024",
          Mulai_Tanam: "20/02/2024",
          Forcing_Standar: "10/11/2024",
          Real_Forcing: "12/11/2024",
          Selesai_Panen: "20/06/2025",
          Umur_Forcing: 9,
          Umur: 11,
          Total_Cost: "95.000.000",
          "Umur 1": "8.000.000",
          "Umur 2": "9.500.000",
          "Umur 3": "7.200.000",
          "Umur 4": "-",
          "Umur 5": "-",
          "Umur 6": "-",
          "Umur 7": "-",
          "Umur 8": "-",
          "Umur 9": "-",
          "Umur 10": "-",
          "Umur 11": "-",
          "Umur 12": "-",
          "Umur 13": "-",
          "Umur 14": "-",
          "Umur 15": "-",
          "Umur 16": "-",
          "Umur 17": "-",
          "Umur 18": "-",
          "Umur 19": "-",
          "Umur 20": "-",
        },
      ];
    } else if (category === "timeline") {
      fileName = "template_weed_control_data_timeline.xlsx";
      sheetData = [
        {
          Lokasi: "AW0101",
          Awal_Rawat: "01/01/2024",
          Aktivitas: "Aplikasi Herbisida Boom Sprayer",
          Tanggal_Realisasi: "19/05/2024",
          Umur: -6, // Contoh umur negatif pra-tanam
          Hasil: "12,1400",
          UOM: "HA",
          TK: "4,0000",
          Kapasitas_per_TK: "3,0350",
          Total_Cost: "8.500.000",
          Upah: "2.500.000",
          Charge: "1.000.000",
          Material: "5.000.000", // Kolom total biaya material
          // Kolom dinamis kuantitas material setelah kolom Material
          Haloksifop: "12,5000",
          Ametryn: "0",
          Indostick: "-",
          Glyphosate: "20,0000",
          Bromacyl: "-",
          Diuron: "5,0000",
          Urea: "-",
        },
        {
          Lokasi: "AW0101",
          Awal_Rawat: "01/01/2024",
          Aktivitas: "Weed Control Manual Spotting",
          Tanggal_Realisasi: "25/06/2024",
          Umur: 1,
          Hasil: "6,0000",
          UOM: "HA",
          TK: "3,0000",
          Kapasitas_per_TK: "2,0000",
          Total_Cost: "3.200.000",
          Upah: "1.800.000",
          Charge: "400.000",
          Material: "1.000.000",
          Haloksifop: "-",
          Ametryn: "4,5000",
          Indostick: "1,0000",
          Glyphosate: "-",
          Bromacyl: "-",
          Diuron: "-",
          Urea: "-",
        },
      ];
    } else if (category === "aktivitas") {
      fileName = "template_weed_control_data_aktivitas.xlsx";
      sheetData = [
        {
          Lokasi: "AW0101",
          Status: "Nanas",
          Wilayah: "AW01",
          Luas: "12,14",
          Kelas: "A",
          Kode: "WC-001",
          Aktivitas: "Aplikasi Herbisida Boom Sprayer Pre-Planting",
          Biaya: "8.500.000",
          Biaya_per_HA: "700.164,74",
          Upah: "2.500.000",
          Charge: "1.000.000",
          Material: "5.000.000",
          Bibit: "0",
          Hasil: "12,1400",
          UOM: "HA",
          Activity_Group: "Chemical Weed Control",
        },
        {
          Lokasi: "AW0101",
          Status: "Nanas",
          Wilayah: "AW01",
          Luas: "12,14",
          Kelas: "A",
          Kode: "WC-002",
          Aktivitas: "Weed Control Manual Spotting",
          Biaya: "3.200.000",
          Biaya_per_HA: "263.591,43",
          Upah: "1.800.000",
          Charge: "400.000",
          Material: "1.000.000",
          Bibit: "0",
          Hasil: "6,0000",
          UOM: "HA",
          Activity_Group: "Manual Weed Control",
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("Error generating template:", err);
    return NextResponse.json(
      { success: false, message: "Gagal membuat berkas template Excel." },
      { status: 500 }
    );
  }
}
