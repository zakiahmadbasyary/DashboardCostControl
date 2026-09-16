import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, getCookieDomain } from "@/lib/auth";
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
    const domain = getCookieDomain();
    response.cookies.delete({
      name: ADMIN_AUTH_COOKIE,
      path: "/",
      ...(domain ? { domain } : {}),
    });
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: true });
    const domain = getCookieDomain();
    response.cookies.delete({
      name: ADMIN_AUTH_COOKIE,
      path: "/",
      ...(domain ? { domain } : {}),
    });
    return response;
  }
}
