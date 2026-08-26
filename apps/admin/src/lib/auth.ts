import { cookies } from "next/headers";

export const ADMIN_AUTH_COOKIE = "admin_central_session";

export interface AdminPayload {
  userId: string;
  username: string;
  role: string;
  dashboards: Record<string, string>; // e.g. { wip: "FULL", dashboard_a: "READ_ONLY" }
}

export async function getAdminSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE);
  return sessionCookie?.value || null;
}
