import { UserSession } from "@/types/auth";

export const MOCK_ADMIN_USER: UserSession = {
  id: "USR-001",
  username: "admin",
  name: "Administrator GGF",
  role: "admin",
};

export const MOCK_VALID_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};
