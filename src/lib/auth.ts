import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  username?: string;
  role?: "admin" | "user";
  mustChangePassword?: boolean;
}

// Auto-generate a secret if not provided.
// Use globalThis to survive HMR re-evaluation in development.
// Note: auto-generated secrets don't persist across full process restarts.
const globalForAuth = globalThis as unknown as { _sessionSecret: string | undefined };
if (!globalForAuth._sessionSecret) {
  globalForAuth._sessionSecret =
    process.env.SESSION_SECRET || randomBytes(32).toString("hex");
}
const sessionSecret = globalForAuth._sessionSecret;

const sessionOptions = {
  password: sessionSecret,
  cookieName: "pilbum_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && session.role === "admin";
}

export async function requirePasswordChange(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && session.mustChangePassword === true;
}
