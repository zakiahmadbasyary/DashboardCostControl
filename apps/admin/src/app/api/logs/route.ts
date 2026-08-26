import { NextResponse } from "next/server";
import { prismaAdmin } from "@/lib/db";
import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prismaAdmin.adminSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch logs (Super Admin sees all, normal admin sees their own)
    const whereClause = session.user.role === "SUPER_ADMIN" ? {} : { userId: session.user.id };

    const logs = await prismaAdmin.adminActivityLog.findMany({
      where: whereClause,
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("GET Logs Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
