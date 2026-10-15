import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "").toLowerCase().trim();

    let sampleRows: Record<string, unknown>[] = [];
    let fileName = "template.xlsx";

    switch (category) {
      case "created":
        fileName = "template_created.xlsx";
        sampleRows = [
          {
            capex_no: "CAP-2025-001",
            type: "order",
            requestor: "Agus S (Civil Supervisor)",
            req_date: "2025-01-10",
            budget_type: "INVESTASI",
            io: "IO-2025-001",
            mo: "",
            wbs: "",
            cost_center: "CC-PG1-INF",
            quantity: 1,
            amount: 3500000000,
            description: "Pembangunan Gudang Penyimpanan TBS – Blok A3",
            kode_approver: "APP-MGR-01",
            nama: "Budi Santoso",
            date_approve: "2025-01-12",
            no_pr: "PR-2025-001",
            order_no: "ORD-001",
            notes: "Disetujui untuk tender kontraktor utama",
            budget_status: "approved",
            kategori: "Infrastruktur",
            komoditi: "Bangunan",
          },
        ];
        break;

      case "po":
        fileName = "template_po.xlsx";
        sampleRows = [
          {
            nomor_pr: "PR-2025-001",
            keterangan: "Pengadaan Material Sipil & Jasa Konstruksi Gudang TBS",
            quantity: 1,
            unit_of_measure: "LOT",
            valuation_price: 3500000000,
            total: 3500000000,
            request_date: "2025-01-10",
            pgr: "P01",
            no_po: "PO-4500018901",
          },
        ];
        break;

      case "budget":
        fileName = "template_budget.xlsx";
        sampleRows = [
          {
            io: "IO-2025-001",
            mo: "",
            wbs: "",
            description: "Pembangunan Gudang Penyimpanan TBS – Blok A3",
            cost_center: "CC-PG1-INF",
            quantity: 1,
            amount: 3500000000,
            group_capex: "PROJECT-2025",
            capex_no: "CAP-2025-001",
            kategori: "Infrastruktur",
            komoditi: "Bangunan",
            budget_status: "approved",
          },
        ];
        break;

      case "purchasing":
        fileName = "template_purchasing.xlsx";
        sampleRows = [
          {
            pgr: "P01",
            description: "Purchasing Divisi Infrastruktur & Sipil",
            telephone: "021-5550101",
            fax_number: "021-5550102",
          },
        ];
        break;

      case "kategori":
        fileName = "template_kategori.xlsx";
        sampleRows = [
          {
            capex_no: "CAP-2025-001",
            description: "Pembangunan Gudang Penyimpanan TBS – Blok A3",
            cost_center: "CC-PG1-INF",
            kategori: "Infrastruktur",
            komoditi: "Bangunan",
          },
        ];
        break;

      case "approver":
      case "user_approver":
        fileName = "template_user_approver.xlsx";
        sampleRows = [
          {
            kode_approver: "APP-MGR-01",
            nama: "Budi Santoso (Dept Head Civil)",
          },
        ];
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Kategori template tidak valid." },
          { status: 400 }
        );
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat template Excel." },
      { status: 500 }
    );
  }
}
