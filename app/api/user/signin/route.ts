import { NextResponse } from "next/server";

/**
 * POST /api/user/signin
 * 
 * Sign in user - Following Pi Demo App pattern
 * 
 * This endpoint is called after successful Pi SDK authentication.
 * 
 * In production, you should:
 * 1. Verify the access token with Pi API
 * 2. Create or update user record in your database
 * 3. Create a session
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

    console.log("[User API] User signed in:", user.username, "uid:", user.uid);

    // TODO: In production, verify access token and create session
    // const verified = await verifyAccessToken(accessToken);
    // if (!verified) {
    //   return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    // }

    // Create or update user in database
    // await db.users.upsert({
    //   uid: user.uid,
    //   username: user.username,
    //   roles: user.roles,
    //   last_login: new Date()
    // });

    // Create session
    // req.session.currentUser = user;

    return NextResponse.json({
      message: "User signed in successfully",
      user: {
        uid: user.uid,
        username: user.username,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("[User API] Signin error:", error);
    return NextResponse.json(
      { error: "Failed to sign in user" },
      { status: 500 }
    );
  }
}
