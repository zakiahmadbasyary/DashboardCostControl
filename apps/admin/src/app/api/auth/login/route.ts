import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username/Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Lookup by username or email
    const admin = await prismaAdmin.adminUser.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() },
        ],
      },
      include: {
        dashboardAccess: {
          include: {
            dashboard: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Username/Email atau password tidak ditemukan" },
        { status: 401 }
      );
    }

    if (admin.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun Anda dinonaktifkan. Hubungi Super Admin." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Username/Email atau password salah" },
        { status: 401 }
      );
    }

    // Generate token session
    const token = `admin_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    await prismaAdmin.adminSession.create({
      data: {
        token,
        userId: admin.id,
        expiresAt,
      },
    });

    // Audit log
    await prismaAdmin.adminActivityLog.create({
      data: {
        userId: admin.id,
        action: "LOGIN",
        description: `Admin ${admin.username} (${admin.name}) berhasil login. Role: ${admin.role}.`,
      },
    });

    // Determine allowed dashboards
    let allowedDashboards: string[] = [];
    if (admin.role === "SUPER_ADMIN") {
      const allDashboards = await prismaAdmin.dashboard.findMany({ select: { code: true } });
      allowedDashboards = allDashboards.map((d) => d.code);
    } else {
      allowedDashboards = admin.dashboardAccess.map((acc) => acc.dashboard.code);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        allowedDashboards,
      },
      token,
    });

    response.cookies.set(ADMIN_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
