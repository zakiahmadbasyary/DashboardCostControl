import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify server-side session
    const session = getAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Autentikasi diperlukan." },
        { status: 401 }
      );
    }

    const { username, currentPassword, newPassword } = await request.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Semua kolom password wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password baru minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Ensure user changes their own password
    if (session.username !== username.trim()) {
      return NextResponse.json(
        { success: false, message: "Anda hanya dapat mengedit kata sandi akun Anda sendiri." },
        { status: 403 }
      );
    }

    // Find target user in DB
    const user = await prisma.user.findFirst({
      where: { username: username.trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User admin tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Verify current password with bcrypt (or plain text fallback)
    let isCurrentValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isCurrentValid = await bcrypt.compare(currentPassword.trim(), user.password);
    } else {
      isCurrentValid = user.password === currentPassword.trim();
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: "Password saat ini tidak sesuai." },
        { status: 400 }
      );
    }

    // Check if new password is same as current password
    if (currentPassword.trim() === newPassword.trim()) {
      return NextResponse.json(
        { success: false, message: "Password baru harus berbeda dengan password saat ini." },
        { status: 400 }
      );
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

    // Update password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "CHANGE_PASSWORD",
        dataSource: "-",
        description: `Admin ${user.username} berhasil memperbarui kata sandi akun`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui! Silakan gunakan password baru ini untuk login berikutnya.",
    });
  } catch (error: unknown) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui password karena kesalahan server." },
      { status: 500 }
    );
  }
}
