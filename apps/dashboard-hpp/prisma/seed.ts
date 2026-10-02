import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing HPP Database (removing dummy data)...");

  await prisma.aktivitasHPP.deleteMany();
  await prisma.lokasiHPP.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.masterSheet.deleteMany();

  console.log("✅ HPP Database cleaned successfully. Ready for real Excel data upload.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error clearing HPP database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });


