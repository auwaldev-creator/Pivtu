import { NextResponse } from "next/server";
import { getSession, isAdmin } from "./session";

// Middleware to protect API routes - requires authentication
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }
  
  return null; // No error, proceed with request
}

// Middleware to protect admin routes - requires admin access
export async function requireAdmin() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }
  
  const adminAccess = await isAdmin();
  if (!adminAccess) {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }
  
  return null; // No error, proceed with request
}

// Verify admin password
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error("[Auth] ADMIN_PASSWORD environment variable not set");
    return false;
  }
  
  return password === adminPassword;
}
