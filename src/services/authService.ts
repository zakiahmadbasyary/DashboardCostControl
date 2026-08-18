import { LoginCredentials, AuthResponse, UserSession } from "@/types/auth";
import { MOCK_ADMIN_USER, MOCK_VALID_CREDENTIALS } from "@/mocks/users";

const SESSION_KEY = "ggf_agrometric_session";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (
      credentials.username === MOCK_VALID_CREDENTIALS.username &&
      credentials.password === MOCK_VALID_CREDENTIALS.password
    ) {
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_ADMIN_USER));
      }
      return {
        success: true,
        message: "Login berhasil. Selamat datang di Admin Panel GGF AgroMetric.",
        user: MOCK_ADMIN_USER,
      };
    }

    return {
      success: false,
      message: "Username atau password salah. Silakan coba lagi.",
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
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
