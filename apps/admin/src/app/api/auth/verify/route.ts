import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenQuery = searchParams.get("token");
    const userIdQuery = searchParams.get("userId");
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

    const token = tokenQuery || authHeader || tokenCookie;

    // 1. If userId parameter is provided (central session revocation check from sub-dashboards)
    if (userIdQuery) {
      const user = await prismaAdmin.adminUser.findUnique({
        where: { id: userIdQuery },
        include: {
          sessions: {
            where: {
              expiresAt: { gt: new Date() },
            },
          },
          dashboardAccess: {
            include: {
              dashboard: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 });
      }

      if (user.status !== "ACTIVE") {
        return NextResponse.json({ authenticated: false, error: "Account inactive" }, { status: 403 });
      }

      if (!user.sessions || user.sessions.length === 0) {
        return NextResponse.json({ authenticated: false, error: "Central session expired or logged out" }, { status: 401 });
      }

      let allowedDashboards: string[] = [];
      if (user.role === "SUPER_ADMIN") {
        const allDashboards = await prismaAdmin.dashboard.findMany({ select: { code: true } });
        allowedDashboards = allDashboards.map((d) => d.code);
      } else {
        allowedDashboards = user.dashboardAccess.map((acc) => acc.dashboard.code);
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          allowedDashboards,
        },
      });
    }

    // 2. Otherwise verify via token
    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No token provided" }, { status: 401 });
    }

    const session = await prismaAdmin.adminSession.findUnique({
      where: { token },
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
      return NextResponse.json({ authenticated: false, error: "Session expired or invalid" }, { status: 401 });
    }

    if (session.user.status !== "ACTIVE") {
      return NextResponse.json({ authenticated: false, error: "Account inactive" }, { status: 403 });
    }

    let allowedDashboards: string[] = [];
    if (session.user.role === "SUPER_ADMIN") {
      const allDashboards = await prismaAdmin.dashboard.findMany({ select: { code: true } });
      allowedDashboards = allDashboards.map((d) => d.code);
    } else {
      allowedDashboards = session.user.dashboardAccess.map((acc) => acc.dashboard.code);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        allowedDashboards,
      },
    });
  } catch (error: any) {
    console.error("Verify Auth Error:", error);
    return NextResponse.json({ authenticated: false, error: "Server error" }, { status: 500 });
  }
}
