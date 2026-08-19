import * as XLSX from "xlsx";
import * as path from "path";

const dataDir = path.join(process.cwd(), "src", "data");
const locFile = path.join(dataDir, "DataLokasi.xlsx");
const locWb = XLSX.readFile(locFile);
const locRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(locWb.Sheets[locWb.SheetNames[0]]);

console.log("Sample 20 DataLokasi Rows:");
console.table(locRows.slice(0, 20).map((r) => ({
  GroupCost: r["GroupCost"],
  Keterangan: r["Keterangan_Group_Cost"],
  TypeCost: r["TypeCost"],
  Cost: r["Cost"]
})));

const znRows = locRows.filter((r) => String(r["GroupCost"] || "").toUpperCase().startsWith("ZN") || String(r["TypeCost"] || "").toLowerCase() === "direct");
const zwRows = locRows.filter((r) => String(r["GroupCost"] || "").toUpperCase().startsWith("ZW") || String(r["TypeCost"] || "").toLowerCase() === "indirect");

console.log("\nZN / Direct rows in DataLokasi.xlsx:", znRows.length);
console.log("ZW / Indirect rows in DataLokasi.xlsx:", zwRows.length);
