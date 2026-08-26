import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { prismaAdmin } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

    if (token) {
      await prismaAdmin.adminSession.deleteMany({
        where: { token },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_AUTH_COOKIE);
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_AUTH_COOKIE);
    return response;
  }
}
