import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Session configuration
const SESSION_COOKIE_NAME = "pivtu_session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-secret-change-in-production-32chars"
);
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionData {
  uid: string;
  username: string;
  walletAddress?: string;
  roles: string[];
  iat: number;
  exp: number;
}

// Create a new session
export async function createSession(data: Omit<SessionData, "iat" | "exp">): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const token = await new SignJWT({
    uid: data.uid,
    username: data.username,
    walletAddress: data.walletAddress,
    roles: data.roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_EXPIRY)
    .sign(SESSION_SECRET);

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY,
    path: "/",
  });

  return token;
}

// Get current session
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error("[Session] Error verifying session:", error);
    return null;
  }
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Verify if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

// Verify if user is admin (by wallet address)
const ADMIN_WALLET_ADDRESS = "GAIEJAHECAU4IR3QZ2KPCDJDL5WGLBWZRF4QQ4RTTZ5AIVQ74SVFHEU5";

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.walletAddress === ADMIN_WALLET_ADDRESS;
}

// Get admin wallet address (for client-side checks)
export function getAdminWalletAddress(): string {
  return ADMIN_WALLET_ADDRESS;
}
