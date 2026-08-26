import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

async function verifySuperAdminRequest(request: Request) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  const token = tokenCookie || authHeader;

  if (!token) return null;

  const session = await prismaAdmin.adminSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.role !== "SUPER_ADMIN") return null;

  return session.user;
}

export async function GET(request: Request) {
  try {
    const superAdmin = await verifySuperAdminRequest(request);
    if (!superAdmin) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
    }

    const users = await prismaAdmin.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        dashboardAccess: {
          include: {
            dashboard: true,
          },
        },
      },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      allowedDashboards: u.role === "SUPER_ADMIN" ? ["ALL"] : u.dashboardAccess.map((d) => d.dashboard.code),
    }));

    const dashboards = await prismaAdmin.dashboard.findMany({ orderBy: { code: "asc" } });

    return NextResponse.json({ users: formattedUsers, dashboards });
  } catch (error: any) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const superAdmin = await verifySuperAdminRequest(request);
    if (!superAdmin) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
    }

    const { name, username, email, password, role, status, dashboardCodes } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const existingUser = await prismaAdmin.adminUser.findFirst({
      where: {
        OR: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username atau email sudah digunakan." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prismaAdmin.adminUser.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role || "ADMIN",
        status: status || "ACTIVE",
      },
    });

    // Assign dashboard access if ADMIN role
    if (role !== "SUPER_ADMIN" && Array.isArray(dashboardCodes) && dashboardCodes.length > 0) {
      const dbRecords = await prismaAdmin.dashboard.findMany({
        where: { code: { in: dashboardCodes } },
      });

      for (const dash of dbRecords) {
        await prismaAdmin.userDashboardAccess.create({
          data: {
            userId: newUser.id,
            dashboardId: dash.id,
          },
        });
      }
    }

    // Log Activity
    await prismaAdmin.adminActivityLog.create({
      data: {
        userId: superAdmin.id,
        action: "CREATE_USER",
        description: `Super Admin ${superAdmin.username} membuat user baru: ${newUser.username} (${newUser.role}).`,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("POST User Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const superAdmin = await verifySuperAdminRequest(request);
    if (!superAdmin) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, role, status, password, newPassword, dashboardCodes } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID wajib diisi." }, { status: 400 });
    }

    const pwd = newPassword || password;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (pwd && typeof pwd === "string" && pwd.trim().length > 0) {
      if (pwd.trim().length < 6) {
        return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(pwd.trim(), 10);
    }

    const updatedUser = await prismaAdmin.adminUser.update({
      where: { id },
      data: updateData,
    });

    // Update Dashboard Access mapping if provided
    if (Array.isArray(dashboardCodes)) {
      await prismaAdmin.userDashboardAccess.deleteMany({ where: { userId: id } });

      if (updatedUser.role !== "SUPER_ADMIN" && dashboardCodes.length > 0) {
        const dbRecords = await prismaAdmin.dashboard.findMany({
          where: { code: { in: dashboardCodes } },
        });

        for (const dash of dbRecords) {
          await prismaAdmin.userDashboardAccess.create({
            data: {
              userId: id,
              dashboardId: dash.id,
            },
          });
        }
      }
    }

    // Log Activity
    await prismaAdmin.adminActivityLog.create({
      data: {
        userId: superAdmin.id,
        action: "UPDATE_USER",
        description: `Super Admin ${superAdmin.username} memperbarui user: ${updatedUser.username}.${pwd ? " Password diperbarui." : ""}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PUT User Error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui user" }, { status: 500 });
  }
}
