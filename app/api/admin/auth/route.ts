import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyAdminPassword } from "@/lib/auth-middleware";

// Admin wallet address - only this address can access admin panel
const ADMIN_WALLET_ADDRESS = "GAIEJAHECAU4IR3QZ2KPCDJDL5WGLBWZRF4QQ4RTTZ5AIVQ74SVFHEU5";

/**
 * POST /api/admin/auth
 * 
 * Authenticate admin user
 * Requires: valid session with admin wallet address + correct admin password
 */
export async function POST(request: Request) {
  try {
    const { password, walletAddress } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get current session
    const session = await getSession();

    // Check if wallet address matches admin wallet
    const providedWallet = walletAddress || session?.walletAddress;
    
    if (providedWallet !== ADMIN_WALLET_ADDRESS) {
      console.log("[Admin Auth] Access denied - wallet mismatch");
      console.log("[Admin Auth] Expected:", ADMIN_WALLET_ADDRESS);
      console.log("[Admin Auth] Got:", providedWallet);
      return NextResponse.json(
        { error: "Access denied - unauthorized wallet address" },
        { status: 403 }
      );
    }

    // Verify admin password
    if (!verifyAdminPassword(password)) {
      console.log("[Admin Auth] Invalid password");
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
 * Check if current session has admin access
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { isAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const isAdmin = session.walletAddress === ADMIN_WALLET_ADDRESS;

    return NextResponse.json({
      isAdmin,
      walletAddress: session.walletAddress,
    });
  } catch (error) {
    console.error("[Admin Auth] Check error:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
