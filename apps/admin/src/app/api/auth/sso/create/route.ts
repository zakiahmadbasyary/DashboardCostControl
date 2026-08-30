import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

const ALLOWED_DASHBOARD_CODES = ["wip", "dashboard_a", "dashboard_b", "dashboard_c"];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const sessionToken = tokenCookie || authHeader;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan. Sesi Admin Pusat tidak ditemukan." },
        { status: 401 }
      );
    }

    // Verify session in database
    const session = await prismaAdmin.adminSession.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            dashboardAccess: {
              include: {
                dashboard: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Sesi Admin Pusat tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    const user = session.user;
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Akun Anda dinonaktifkan. Hubungi Super Admin." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { dashboardCode } = body;

    if (!dashboardCode || typeof dashboardCode !== "string" || !ALLOWED_DASHBOARD_CODES.includes(dashboardCode)) {
      return NextResponse.json(
        { success: false, error: "Kode dashboard tidak valid." },
        { status: 400 }
      );
    }

    // Check authorization for dashboardCode
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const hasAccess =
      isSuperAdmin ||
      user.dashboardAccess.some((acc) => acc.dashboard.code === dashboardCode);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Anda tidak memiliki izin untuk mengelola dashboard ini." },
        { status: 403 }
      );
    }

    // Generate cryptographically secure one-time SSO token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds TTL

    await prismaAdmin.adminSsoToken.create({
      data: {
        tokenHash,
        userId: user.id,
        dashboardCode,
        expiresAt,
      },
    });

    // Audit log (Do NOT log raw token)
    await prismaAdmin.adminActivityLog.create({
      data: {
        userId: user.id,
        action: "SSO_HANDOFF_CREATED",
        dashboardCode,
        description: `Admin ${user.username} (${user.role}) membuat token SSO untuk dashboard: ${dashboardCode}.`,
      },
    });

    return NextResponse.json({
      success: true,
      token: rawToken,
      expiresIn: 60,
    });
  } catch (error: any) {
    console.error("POST SSO Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
