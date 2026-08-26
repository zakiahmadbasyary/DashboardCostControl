import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenQuery = searchParams.get("token");
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

    const token = tokenQuery || authHeader || tokenCookie;

    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No token provided" }, { status: 401 });
    }

    const session = await prismaAdmin.adminSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            accessList: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ authenticated: false, error: "Session expired or invalid" }, { status: 401 });
    }

    const accessMap: Record<string, string> = {};
    session.user.accessList.forEach((acc) => {
      accessMap[acc.dashboardKey] = acc.accessLevel;
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
        access: accessMap,
      },
    });
  } catch (error: any) {
    console.error("Verify Auth Error:", error);
    return NextResponse.json({ authenticated: false, error: "Server error" }, { status: 500 });
  }
}
