import { NextResponse } from "next/server";

// Pi Platform API Configuration
const PI_API_KEY = process.env.PI_API_KEY || "";
const PI_API_URL = "https://api.minepi.com";

// Platform API Client
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
};

/**
 * POST /api/payments/complete
 * 
 * Complete a payment - Following Pi Demo App pattern
 * 
 * This endpoint is called when Pi.createPayment triggers onReadyForServerCompletion.
 * 
 * In production, you should:
 * 1. Verify the transaction on the Pi blockchain
 * 2. Update the order record in your database
 * 3. Deliver the product/service to the user
 * 4. Call Pi API to complete the payment
 */
export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json();

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: "Missing paymentId or txid" },
        { status: 400 }
      );
    }

    console.log("[Payments API] Completing payment:", paymentId, "txid:", txid);

    // In production with PI_API_KEY set:
    if (PI_API_KEY) {
      // TODO: In production, verify the transaction and update your database
      // const horizonResponse = await fetch(`https://api.mainnet.minepi.com/transactions/${txid}`);
      // const txData = await horizonResponse.json();
      
      // Update order record
      // await db.orders.update(
      //   { pi_payment_id: paymentId },
      //   { txid: txid, paid: true }
      // );

      // Deliver the data plan to the user
      // await deliverDataPlan(paymentId);

      // Let Pi server know that the payment is completed
      await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, {
        txid,
      });
    } else {
      // Sandbox mode - simulate completion
      console.log("[Payments API] Sandbox mode - simulating completion");
    }

    return NextResponse.json({
      message: `Completed the payment ${paymentId}`,
    });
  } catch (error) {
    console.error("[Payments API] Completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}
