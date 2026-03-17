import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth-middleware";

/**
 * POST /api/admin/auth
 * 
 * Authenticate admin user with password only
 * Requires: ADMIN_PASSWORD environment variable to be set
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify admin password
    if (!verifyAdminPassword(password)) {
      console.log("[Admin Auth] Invalid password attempt");
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }

    console.log("[Admin Auth] Admin authenticated successfully");

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
    });
  } catch (error) {
    console.error("[Admin Auth] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth
 * 
 * Health check for admin auth endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Admin auth endpoint is available",
  });
}
