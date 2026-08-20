import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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

    // Find target user
    const user = await prisma.user.findFirst({
      where: { username: username.trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User admin tidak ditemukan." },
        { status: 404 }
      );
    }

    // Verify current password
    if (user.password !== currentPassword.trim()) {
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

    // Update password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword.trim() },
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memperbarui password: ${message}` },
      { status: 500 }
    );
  }
}
