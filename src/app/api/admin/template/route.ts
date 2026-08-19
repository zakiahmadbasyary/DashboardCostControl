import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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

    const filePath = path.join(process.cwd(), "storage", "excelWIP", "template", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: `File template ${fileName} tidak ditemukan.` }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
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
