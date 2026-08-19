import { LoginCredentials, AuthResponse, UserSession } from "@/types/auth";
import { activityLogService } from "@/services/activityLogService";

const SESSION_KEY = "ggf_agrometric_session";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await res.json();

      if (data.success && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        }

        // Record LOGIN activity log
        try {
          await activityLogService.addLog({
            adminUsername: data.user.username,
            action: "LOGIN",
            dataSource: "-",
            description: "Admin login ke sistem panel",
          });
        } catch (e) {
          console.error("Failed to record login log:", e);
        }

        return data;
      }

      return {
        success: false,
        message: data.message || "Username atau password salah. Silakan coba lagi.",
      };
    } catch {
      return {
        success: false,
        message: "Terjadi kesalahan koneksi saat login.",
      };
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getCurrentUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session) as UserSession;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
