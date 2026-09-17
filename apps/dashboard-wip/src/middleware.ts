import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken, attachSessionCookie, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminPublicBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";
  const adminInternalBaseUrl =
    process.env.SSO_INTERNAL_URL || process.env.INTERNAL_ADMIN_URL || "http://127.0.0.1:3005";

  // 1. SSO One-Time Token Exchange Handoff
  const ssoToken = request.nextUrl.searchParams.get("sso");

  if (ssoToken) {
    try {
      // Exchange one-time SSO token with Admin Pusat
      const exchangeRes = await fetch(`${adminInternalBaseUrl}/api/auth/sso/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: ssoToken, dashboardCode: "wip" }),
        cache: "no-store",
      });

      if (exchangeRes.ok) {
        const exchangeData = await exchangeRes.json();
        if (exchangeData.success && exchangeData.user) {
          // Generate local session token for WIP dashboard
          const localToken = createSessionToken({
            id: exchangeData.user.id,
            username: exchangeData.user.username,
            role: exchangeData.user.role,
          });

          // Redirect to clean target URL without ?sso= query parameter
          const cleanUrl = new URL(request.nextUrl.pathname, request.url);
          request.nextUrl.searchParams.forEach((val, key) => {
            if (key !== "sso") {
              cleanUrl.searchParams.append(key, val);
            }
          });

          const response = NextResponse.redirect(cleanUrl);
          // Set local HttpOnly, Secure, SameSite=Lax admin_session cookie
          return attachSessionCookie(response, localToken);
        }
      }
    } catch (e) {
      console.error("SSO Exchange Error in middleware:", e);
    }

    // If exchange fails, redirect to Central Admin login page
    return NextResponse.redirect(new URL(`${adminPublicBaseUrl}/login?error=sso_failed`));
  }

  // 2. Validate Local Session Token & Central Session Revocation Status
  const localCookie = request.cookies.get("admin_session")?.value;
  if (localCookie) {
    const payload = verifySessionToken(localCookie);
    if (payload && payload.id) {
      try {
        const verifyRes = await fetch(`${adminInternalBaseUrl}/api/auth/verify?userId=${payload.id}`, {
          headers: { "Cache-Control": "no-cache" },
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.authenticated && verifyData.user) {
            const isSuperAdmin = verifyData.user.role === "SUPER_ADMIN";
            const hasWipAccess =
              Array.isArray(verifyData.user.allowedDashboards) &&
              verifyData.user.allowedDashboards.includes("wip");

            if (isSuperAdmin || hasWipAccess) {
              return NextResponse.next();
            }
          }
        }
      } catch (e) {
        console.warn("Central session verification check failed, falling back:", e);
      }

      // If central session was revoked, logged out, or access removed, clear local session and redirect
      const redirectRes = NextResponse.redirect(new URL(`${adminPublicBaseUrl}/login?error=session_expired`));
      redirectRes.cookies.delete("admin_session");
      return redirectRes;
    }
  }

  // 3. Fallback: Central Session Check (If request carries central admin session cookie / authorization header)
  const centralCookie = request.cookies.get("admin_central_session")?.value;
  const authHeader = request.headers.get("authorization");
  const fallbackToken = centralCookie || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null);

  // If central session cookie/token does not exist (user logged out from Admin Pusat or session ended)
  if (!fallbackToken) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token sesi Admin Utama telah berakhir atau logout.",
        },
        { status: 401 }
      );
    }

    const redirectRes = NextResponse.redirect(new URL(`${adminPublicBaseUrl}/login`));
    redirectRes.cookies.delete("admin_session");
    return redirectRes;
  }

  try {
    // Verify fallback central token with Admin Pusat Central Auth API
    const verifyRes = await fetch(`${adminInternalBaseUrl}/api/auth/verify?token=${fallbackToken}`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!verifyRes.ok) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ success: false, error: "Session tidak valid" }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`${adminPublicBaseUrl}/login`));
    }

    const data = await verifyRes.json();
    if (!data.authenticated || !data.user) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ success: false, error: "Sesi telah berakhir" }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`${adminPublicBaseUrl}/login`));
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
      return NextResponse.rewrite(new URL("/403", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.warn("Middleware verify request error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
