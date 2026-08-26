import { PrismaClient } from "@prisma/client-admin";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  const dashboards = ["wip", "dashboard_a", "dashboard_b", "dashboard_c"];
  for (const dash of dashboards) {
    await prisma.dashboardAccess.upsert({
      where: {
        userId_dashboardKey: {
          userId: admin.id,
          dashboardKey: dash,
        },
      },
      update: { accessLevel: "FULL" },
      create: {
        userId: admin.id,
        dashboardKey: dash,
        accessLevel: "FULL",
      },
    });
  }

  console.log("Seeding Admin Pusat berhasil:", admin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
