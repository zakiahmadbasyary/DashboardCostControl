import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1. Seed Master Dashboards
  const dashboards = [
    {
      code: "wip",
      name: "Dashboard WIP (Cost Control)",
      adminUrl: "http://localhost:3000/admin",
      publicUrl: "http://localhost:3000",
      status: "ACTIVE",
    },
    {
      code: "dashboard_a",
      name: "Dashboard A (Operasional)",
      adminUrl: "http://localhost:3002/admin",
      publicUrl: "http://localhost:3002",
      status: "DEVELOPMENT",
    },
    {
      code: "dashboard_b",
      name: "Dashboard B (Inventaris)",
      adminUrl: "http://localhost:3003/admin",
      publicUrl: "http://localhost:3003",
      status: "DEVELOPMENT",
    },
    {
      code: "dashboard_c",
      name: "Dashboard C (Finansial)",
      adminUrl: "http://localhost:3004/admin",
      publicUrl: "http://localhost:3004",
      status: "DEVELOPMENT",
    },
  ];

  const dbDashboards: Record<string, any> = {};

  for (const dash of dashboards) {
    const created = await prisma.dashboard.upsert({
      where: { code: dash.code },
      update: {
        name: dash.name,
        adminUrl: dash.adminUrl,
        publicUrl: dash.publicUrl,
        status: dash.status,
      },
      create: dash,
    });
    dbDashboards[dash.code] = created;
  }

  // 2. Seed Super Admin User
  const superAdmin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "Super Administrator",
      username: "admin",
      email: "admin@ggf.co.id",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // 3. Seed Sample Normal Admin (WIP Only)
  const adminWip = await prisma.adminUser.upsert({
    where: { username: "admin_wip" },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Admin WIP Cost Control",
      username: "admin_wip",
      email: "admin.wip@ggf.co.id",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.userDashboardAccess.upsert({
    where: {
      userId_dashboardId: {
        userId: adminWip.id,
        dashboardId: dbDashboards["wip"].id,
      },
    },
    update: {},
    create: {
      userId: adminWip.id,
      dashboardId: dbDashboards["wip"].id,
    },
  });

  // 4. Seed Sample Normal Admin (Dashboard A & B Only)
  const adminOps = await prisma.adminUser.upsert({
    where: { username: "admin_ops" },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Admin Ops & Logistik",
      username: "admin_ops",
      email: "admin.ops@ggf.co.id",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  for (const code of ["dashboard_a", "dashboard_b"]) {
    await prisma.userDashboardAccess.upsert({
      where: {
        userId_dashboardId: {
          userId: adminOps.id,
          dashboardId: dbDashboards[code].id,
        },
      },
      update: {},
      create: {
        userId: adminOps.id,
        dashboardId: dbDashboards[code].id,
      },
    });
  }

  console.log("Seeding Admin Pusat berhasil:");
  console.log("- Super Admin:", superAdmin.username);
  console.log("- Admin WIP:", adminWip.username);
  console.log("- Admin Ops:", adminOps.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
