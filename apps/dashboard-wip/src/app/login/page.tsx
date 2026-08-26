import { redirect } from "next/navigation";

export default function LoginPage() {
  // Single Login Policy: Redirect to Central Admin Login
  redirect("http://localhost:3001/login");
}
