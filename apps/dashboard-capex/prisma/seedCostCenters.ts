import prisma from "../src/lib/prisma";
import { COST_CENTER_MAP } from "../src/lib/costCenters";

async function main() {
  console.log("Checking distinct cost centers from DB tables...");

  const [b, c, k, t] = await Promise.all([
    prisma.budget.findMany({ select: { costCenter: true }, distinct: ["costCenter"] }),
    prisma.created.findMany({ select: { costCenter: true }, distinct: ["costCenter"] }),
    prisma.kategori.findMany({ select: { costCenter: true }, distinct: ["costCenter"] }),
    prisma.total.findMany({ select: { costCenter: true }, distinct: ["costCenter"] }),
  ]);

  const allCodes = new Set<string>();

  // Add codes from DB
  [...b, ...c, ...k, ...t].forEach((item) => {
    if (item.costCenter) {
      allCodes.add(item.costCenter.trim());
    }
  });

  // Add all known codes from COST_CENTER_MAP
  Object.keys(COST_CENTER_MAP).forEach((code) => allCodes.add(code.trim()));

  console.log(`Found ${allCodes.size} total cost center codes to seed.`);

  // 1. Ensure table exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "cost_center" (
      "kode_cost_center" TEXT NOT NULL,
      "keterangan" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "cost_center_pkey" PRIMARY KEY ("kode_cost_center")
    );
  `);

  // 2. Insert or update each code
  let inserted = 0;
  for (const code of allCodes) {
    const ket = COST_CENTER_MAP[code] || code;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "cost_center" ("kode_cost_center", "keterangan", "updated_at")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("kode_cost_center") DO UPDATE
      SET "keterangan" = EXCLUDED."keterangan";
    `,
      code,
      ket
    );
    inserted++;
  }

  console.log(`Successfully ensured and seeded ${inserted} records in "cost_center" table.`);
}

main()
  .catch((e) => {
    console.error("Error seeding cost centers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
