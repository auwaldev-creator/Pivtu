import { NextResponse } from "next/server";

/**
 * GET /api/user/signout
 * 
 * Sign out user - Following Pi Demo App pattern
 * 
 * In production, you should destroy the session.
 */
export async function GET() {
  try {
    console.log("[User API] User signed out");

    // TODO: In production, destroy session
    // req.session.destroy();

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
