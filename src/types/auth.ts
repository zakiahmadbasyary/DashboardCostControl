export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: "admin" | "user";
}

export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserSession;
}

export interface ChangePasswordPayload {
  username: string;
  currentPassword: string;
  newPassword: string;
}

