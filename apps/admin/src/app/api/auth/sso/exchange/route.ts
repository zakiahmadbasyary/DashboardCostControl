import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, dashboardCode } = body;

    if (!token || typeof token !== "string" || !dashboardCode || typeof dashboardCode !== "string") {
      return NextResponse.json(
        { success: false, error: "SSO token tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const ssoRecord = await prismaAdmin.adminSsoToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            sessions: true,
            dashboardAccess: {
              include: {
                dashboard: true,
              },
            },
          },
        },
      },
    });

    if (!ssoRecord) {
      return NextResponse.json(
        { success: false, error: "SSO token tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    // Replay attack check
    if (ssoRecord.usedAt !== null) {
      return NextResponse.json(
        { success: false, error: "SSO token telah digunakan." },
        { status: 401 }
      );
    }

    // Expiry check
    if (ssoRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "SSO token telah kedaluwarsa." },
        { status: 401 }
      );
    }

    // Dashboard code matching check
    if (ssoRecord.dashboardCode !== dashboardCode) {
      return NextResponse.json(
        { success: false, error: "SSO token tidak sesuai untuk dashboard ini." },
        { status: 401 }
      );
    }

    const user = ssoRecord.user;

    // Check user active status
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Akun Anda dinonaktifkan. Hubungi Super Admin." },
        { status: 403 }
      );
    }

    // Authorization check
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

    // Check underlying Central Admin session validity (session revocation test)
    const hasValidCentralSession = user.sessions.some(
      (sess) => sess.expiresAt > new Date()
    );

    if (!hasValidCentralSession) {
      return NextResponse.json(
        { success: false, error: "Sesi Admin Pusat telah berakhir atau dicabut." },
        { status: 401 }
      );
    }

    // Atomic update to mark token as used immediately, preventing race conditions
    const updateResult = await prismaAdmin.adminSsoToken.updateMany({
      where: {
        id: ssoRecord.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    if (updateResult.count === 0) {
      return NextResponse.json(
        { success: false, error: "SSO token telah digunakan." },
        { status: 401 }
      );
    }

    // Audit log (Do NOT log raw token)
    await prismaAdmin.adminActivityLog.create({
      data: {
        userId: user.id,
        action: "SSO_EXCHANGED",
        dashboardCode,
        description: `Token SSO berhasil ditukarkan oleh admin ${user.username} (${user.role}) untuk dashboard: ${dashboardCode}.`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("POST SSO Exchange Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
