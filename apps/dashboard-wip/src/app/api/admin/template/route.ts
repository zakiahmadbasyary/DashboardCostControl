import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = String(searchParams.get("category") || "").toLowerCase().trim();

    let fileName = "";
    if (category === "mastersheet") {
      fileName = "mastersheet.xlsx";
    } else if (category === "sbt") {
      fileName = "DataSBT.xlsx";
    } else if (category === "lokasi") {
      fileName = "DataLokasi.xlsx";
    } else if (category === "aktivitas") {
      fileName = "DataAktivitas.xlsx";
    } else {
      return NextResponse.json({ success: false, message: `Kategori '${category}' tidak dikenal.` }, { status: 400 });
    }

    const fileBuffer = storage.readTemplateFile(fileName);

    if (!fileBuffer) {
      return NextResponse.json({ success: false, message: `File template ${fileName} tidak ditemukan.` }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error serving template file:", error);
    return NextResponse.json({ success: false, message: `Gagal mengunduh template: ${message}` }, { status: 500 });
  }
}
