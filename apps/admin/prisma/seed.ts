import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const wipAccUrl = process.env.NEXT_PUBLIC_WIP_ACC_URL || process.env.NEXT_PUBLIC_WIP_URL || "http://localhost:3001";
  const wipPg1Url = process.env.NEXT_PUBLIC_WIP_PG1_URL || process.env.NEXT_PUBLIC_DASHBOARD_A_URL || "http://localhost:3002";
  const hppPg1Url = process.env.NEXT_PUBLIC_HPP_PG1_URL || process.env.NEXT_PUBLIC_DASHBOARD_B_URL || "http://localhost:3003";
  const hppM3Url = process.env.NEXT_PUBLIC_HPP_M3_URL || process.env.NEXT_PUBLIC_DASHBOARD_C_URL || "http://localhost:3004";

  // 1. Seed Master Dashboards
  const dashboards = [
    {
      code: "wip",
      name: "Dashboard WIP (Cost Control)",
      adminUrl: `${wipAccUrl}/admin`,
      publicUrl: wipAccUrl,
      status: "ACTIVE",
    },
    {
      code: "dashboard_a",
      name: "Dashboard A (Operasional)",
      adminUrl: `${wipPg1Url}/admin`,
      publicUrl: wipPg1Url,
      status: "DEVELOPMENT",
    },
    {
      code: "dashboard_b",
      name: "Dashboard B (Inventaris)",
      adminUrl: `${hppPg1Url}/admin`,
      publicUrl: hppPg1Url,
      status: "DEVELOPMENT",
    },
    {
      code: "dashboard_c",
      name: "Dashboard C (Finansial)",
      adminUrl: `${hppM3Url}/admin`,
      publicUrl: hppM3Url,
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
