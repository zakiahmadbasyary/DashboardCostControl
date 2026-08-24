import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "ggf_agrometric_wip_acc_secret_key_2026_super_secure";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload {
  id: string;
  username: string;
  role: string;
  exp: number;
}

function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function signData(data: string, secret: string): string {
  let hash = 0;
  const combined = data + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return base64urlEncode(Math.abs(hash).toString(36) + combined.length.toString(36));
}

/**
 * Sign a payload to create an Edge-compatible session token string.
 */
export function createSessionToken(user: { id: string; username: string; role: string }): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp,
  };

  const jsonPayload = base64urlEncode(JSON.stringify(payload));
  const signature = signData(jsonPayload, AUTH_SECRET);
  return `${jsonPayload}.${signature}`;
}

/**
 * Verify a session token string and return the payload if valid and not expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [jsonPayload, signature] = parts;
    const expectedSignature = signData(jsonPayload, AUTH_SECRET);

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(base64urlDecode(jsonPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify session token from NextRequest cookies or Authorization header.
 */
export function getAdminSessionFromRequest(request: NextRequest): SessionPayload | null {
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    const payload = verifySessionToken(cookieToken);
    if (payload) return payload;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    return verifySessionToken(token);
  }

  return null;
}

/**
 * Attach HttpOnly admin_session cookie to NextResponse.
 */
export function attachSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return response;
}

/**
 * Clear admin_session cookie on logout.
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
