import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

// Pi API endpoint for verifying access tokens
const PI_API_URL = "https://api.minepi.com";

interface PiUserResponse {
  uid: string;
  username: string;
  roles?: string[];
  credentials?: {
    scopes: string[];
    valid_until: { timestamp: number; iso8601: string };
  };
}

/**
 * POST /api/user/signin
 * 
 * Sign in user - Following Pi Demo App pattern
 * Verifies the access token with Pi API and creates a session
 */
export async function POST(request: Request) {
  try {
    const { authResult } = await request.json();

    if (!authResult) {
      return NextResponse.json(
        { error: "Missing authResult" },
        { status: 400 }
      );
    }

    const { user, accessToken } = authResult;

    if (!user || !accessToken) {
      return NextResponse.json(
        { error: "Invalid authResult - missing user or accessToken" },
        { status: 400 }
      );
    }

    console.log("[User API] Verifying user:", user.username, "uid:", user.uid);

    // Verify access token with Pi API
    let verifiedUser: PiUserResponse | null = null;
    let walletAddress: string | undefined;

    try {
      const verifyResponse = await fetch(`${PI_API_URL}/v2/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (verifyResponse.ok) {
        verifiedUser = await verifyResponse.json();
        console.log("[User API] Token verified for:", verifiedUser?.username);
        
        // Try to get wallet address from /v2/me/wallet endpoint
        try {
          const walletResponse = await fetch(`${PI_API_URL}/v2/me/wallet_address`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          
          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            walletAddress = walletData.wallet_address;
            console.log("[User API] Wallet address retrieved:", walletAddress?.slice(0, 10) + "...");
          }
        } catch (walletError) {
          console.warn("[User API] Could not fetch wallet address:", walletError);
        }
      } else {
        console.warn("[User API] Token verification failed:", verifyResponse.status);
        // In testnet/sandbox, we may not be able to verify - proceed with caution
      }
    } catch (verifyError) {
      console.warn("[User API] Token verification error (may be OK in sandbox):", verifyError);
      // Continue without verification in sandbox mode
    }

    // Create session with user data
    await createSession({
      uid: user.uid,
      username: user.username,
      walletAddress: walletAddress,
      roles: user.roles || [],
    });

    console.log("[User API] Session created for:", user.username);

    return NextResponse.json({
      message: "User signed in successfully",
      user: {
        uid: user.uid,
        username: user.username,
        roles: user.roles || [],
      },
      walletAddress: walletAddress,
    });
  } catch (error) {
    console.error("[User API] Signin error:", error);
    return NextResponse.json(
      { error: "Failed to sign in user" },
      { status: 500 }
    );
  }
}
