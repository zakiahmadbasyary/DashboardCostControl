import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "mastersheet";

    let filename = "mastersheet_template.xlsx";
    if (category === "budget") {
      filename = "data_budget_template.xlsx";
    } else if (category === "lokasi") {
      filename = "data_lokasi_template.xlsx";
    } else if (category === "aktivitas") {
      filename = "data_aktivitas_template.xlsx";
    } else if (category === "mastersheet") {
      filename = "mastersheet_template.xlsx";
    }

    const filePath = path.join(process.cwd(), "public", "templates", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { status: "error", message: `File template ${filename} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving Excel template:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil file template Excel." },
      { status: 500 }
    );
  }
}
