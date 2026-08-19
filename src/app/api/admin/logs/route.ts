import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dataSource, fileName, description, adminUsername } = body;

    // Find admin user
    const user = await prisma.user.findFirst({
      where: { username: adminUsername || "admin" },
    });

    if (!user) {
      return NextResponse.json({ error: "User admin not found" }, { status: 404 });
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
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
