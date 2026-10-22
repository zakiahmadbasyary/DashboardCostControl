import { PrismaClient } from "./src/generated/client/index.js";
const prisma = new PrismaClient();

async function checkRows() {
  const all = await prisma.created.findMany({
    orderBy: { idCreated: "desc" },
    select: { idCreated: true, capexNo: true, description: true },
  });
  console.log("Total baris created:", all.length);
  console.log("5 baris created teratas:");
  console.table(all.slice(0, 5).map(r => ({ ...r, idCreated: r.idCreated.toString() })));
  const idx = all.findIndex((r) => r.capexNo === "17020");
  console.log("Posisi 17020 berada di urutan index ke-:", idx + 1, "dari total", all.length, "baris");
  if (idx !== -1) {
    const pageAt50 = Math.ceil((idx + 1) / 50);
    console.log("Pada limit 50/halaman, 17020 berada di Halaman:", pageAt50);
  }
}

checkRows().finally(() => prisma.$disconnect());
