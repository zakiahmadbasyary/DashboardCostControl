import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting database CAPEX (removing all data)...");

  // Clear all data in reverse order of foreign keys
  await prisma.created.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.total.deleteMany();
  await prisma.po.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.userApprover.deleteMany();
  await prisma.purchasing.deleteMany();

  console.log("Database CAPEX is now completely clean and ready for user uploads via Admin Panel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
