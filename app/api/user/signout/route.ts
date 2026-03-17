import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

/**
 * GET /api/user/signout
 * 
 * Sign out user - Destroys the session cookie
 */
export async function GET() {
  try {
    console.log("[User API] User signed out");

    // Destroy the session
    await destroySession();

    return NextResponse.json({
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("[User API] Signout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out user" },
      { status: 500 }
    );
  }
}
