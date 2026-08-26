import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieToken = request.cookies.get("admin_session")?.value || request.cookies.get("admin_central_session")?.value;
  const authHeader = request.headers.get("authorization");
  const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null);

  const isValidSession = token ? (token.startsWith("admin_tok_") || verifySessionToken(token) !== null) : false;

  // Protect Admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!isValidSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Anda harus login melalui Admin Pusat atau Admin WIP untuk mengakses endpoint ini.",
        },
        { status: 401 }
      );
    }
  }

  // Protect Admin UI pages
  if (pathname.startsWith("/admin")) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
