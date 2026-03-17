import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Pi Platform API Configuration
const PI_API_KEY = process.env.PI_API_KEY || "";
const PI_API_URL = "https://api.minepi.com";

// Platform API Client - Following Pi Demo App structure
const platformAPIClient = {
  async post(endpoint: string, data?: unknown) {
    const response = await fetch(`${PI_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pi API Error: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async get(endpoint: string) {
    const response = await fetch(`${PI_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pi API Error: ${response.status} - ${error}`);
    }

    return response.json();
  },
};

/**
 * POST /api/payments/approve
 * 
 * Approve a payment - Following Pi Demo App pattern
 * 
 * This endpoint is called when Pi.createPayment triggers onReadyForServerApproval.
 * 
 * In production, you should:
 * 1. Verify the user is authenticated
 * 2. Get the current payment details from Pi API
 * 3. Create an order record in your database
 * 4. Call Pi API to approve the payment
 */
export async function POST(request: Request) {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing paymentId" },
        { status: 400 }
      );
    }

    console.log("[Payments API] Approving payment:", paymentId);

    // In production with PI_API_KEY set:
    if (PI_API_KEY) {
      // Get current payment details
      const currentPayment = await platformAPIClient.get(
        `/v2/payments/${paymentId}`
      );

      console.log("[Payments API] Payment details:", currentPayment);

      // TODO: In production, create order record in your database
      // await db.orders.create({
      //   pi_payment_id: paymentId,
      //   product_id: currentPayment.metadata.data_plan_id,
      //   user: currentPayment.user_uid,
      //   txid: null,
      //   paid: false,
      //   cancelled: false,
      //   created_at: new Date()
      // });

      // Let Pi Servers know that you're ready
      await platformAPIClient.post(`/v2/payments/${paymentId}/approve`);
    } else {
      // Sandbox mode - simulate approval
      console.log("[Payments API] Sandbox mode - simulating approval");
    }

    return NextResponse.json({
      message: `Approved the payment ${paymentId}`,
    });
  } catch (error) {
    console.error("[Payments API] Approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve payment" },
      { status: 500 }
    );
  }
}
