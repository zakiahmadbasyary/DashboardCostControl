import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const dataSource = searchParams.get("dataSource");
    const searchQuery = searchParams.get("searchQuery");
    const admin = searchParams.get("admin");

    const where: Record<string, unknown> = {};

    if (action && action !== "all") {
      where.action = action;
    }

    if (dataSource && dataSource !== "all") {
      where.dataSource = dataSource;
    }

    if (admin && admin !== "all") {
      where.user = { username: admin };
    }

    if (searchQuery) {
      where.OR = [
        { description: { contains: searchQuery, mode: "insensitive" } },
        { fileName: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const rawLogs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const logs = rawLogs.map((log) => {
      const d = new Date(log.createdAt);
      const formattedDate = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

      return {
        id: log.id,
        timestamp: formattedDate,
        adminUsername: log.user?.username || "admin",
        action: log.action,
        dataSource: log.dataSource || "-",
        fileName: log.fileName || undefined,
        description: log.description || "",
      };
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Gagal mengambil log aktivitas internal." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);
    const body = await request.json();
    const { action, dataSource, fileName, description } = body;

    // Pull verified user from session if available, else fallback to default admin
    const usernameToFind = session?.username || "admin";
    const user = await prisma.user.findFirst({
      where: { username: usernameToFind },
    });

    if (!user) {
      return NextResponse.json({ error: "User admin tidak ditemukan." }, { status: 404 });
    }

    const newLog = await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: action || "UNKNOWN",
        dataSource: dataSource || null,
        fileName: fileName || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, log: newLog });
  } catch (error: unknown) {
    console.error("Error creating activity log:", error);
    return NextResponse.json({ error: "Gagal menambahkan log aktivitas." }, { status: 500 });
  }
}
