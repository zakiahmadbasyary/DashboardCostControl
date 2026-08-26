import { redirect } from "next/navigation";

export default function LoginPage() {
  const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005";
  // Single Login Policy: Redirect to Central Admin Login
  redirect(`${adminBaseUrl}/login`);
}
