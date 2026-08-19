import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        password: password.trim(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang di Admin Panel GGF AgroMetric.",
      user: {
        id: user.id,
        username: user.username,
        name: "Admin User",
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
