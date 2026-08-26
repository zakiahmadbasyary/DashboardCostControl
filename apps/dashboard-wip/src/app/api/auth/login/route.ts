import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, attachSessionCookie } from "@/lib/auth";
import { loginRateLimiter } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const { limited, retryAfterSeconds } = loginRateLimiter.isRateLimited(ip);

    if (limited) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${retryAfterSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Find user in Database
    const user = await prisma.user.findFirst({
      where: {
        username: username.trim(),
      },
    });

    if (!user) {
      loginRateLimiter.recordFailure(ip);
      return NextResponse.json(
        { success: false, message: "Username atau password salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    // 3. Compare Password using bcrypt (or fallback comparison for backwards compatibility)
    let isPasswordValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password.trim(), user.password);
    } else {
      // Legacy plain text check fallback
      isPasswordValid = user.password === password.trim();
    }

    if (!isPasswordValid) {
      loginRateLimiter.recordFailure(ip);
      return NextResponse.json(
        { success: false, message: "Username atau password salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    loginRateLimiter.reset(ip);

    // 4. Create server-side session token
    const token = createSessionToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const userSessionData = {
      id: user.id,
      username: user.username,
      name: "Admin User",
      role: user.role,
      token,
    };

    // 5. Attach HttpOnly Cookie to Response
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang di Admin Panel GGF AgroMetric.",
      user: userSessionData,
    });

    return attachSessionCookie(response, token);
  } catch (error: unknown) {
    console.error("Error in login API route:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
