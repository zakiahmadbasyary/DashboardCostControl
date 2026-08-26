import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieToken =
    request.cookies.get("admin_central_session")?.value ||
    request.cookies.get("admin_session")?.value;
  const authHeader = request.headers.get("authorization");
  const token =
    cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null);

  // If no token at all, redirect UI requests to Central Admin login
  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token session Admin Pusat tidak ditemukan.",
        },
        { status: 401 }
      );
    }

    const centralLoginUrl = new URL("http://localhost:3001/login");
    return NextResponse.redirect(centralLoginUrl);
  }

  try {
    // Verify token with Admin Pusat Central Auth API
    const verifyRes = await fetch(`http://localhost:3001/api/auth/verify?token=${token}`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!verifyRes.ok) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ success: false, error: "Session tidak valid" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("http://localhost:3001/login"));
    }

    const data = await verifyRes.json();
    if (!data.authenticated || !data.user) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ success: false, error: "Sesi telah berakhir" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("http://localhost:3001/login"));
    }

    const user = data.user;
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const hasWipAccess = Array.isArray(user.allowedDashboards) && user.allowedDashboards.includes("wip");

    if (!isSuperAdmin && !hasWipAccess) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          {
            success: false,
            error: "403 Forbidden: Anda tidak memiliki hak akses untuk mengelola Dashboard WIP.",
          },
          { status: 403 }
        );
      }
      // Redirect UI requests to 403 page
      return NextResponse.rewrite(new URL("/403", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Fallback if Central Admin server is temporarily unreachable in dev mode
    console.warn("Middleware verify request error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
