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
 * POST /api/payments/incomplete
 * 
 * Handle incomplete payment - Following Pi Demo App pattern
 * 
 * This endpoint is called when a user has an incomplete payment from a previous session.
 * 
 * In production, you should:
 * 1. Find the order in your database
 * 2. Verify the transaction on the Pi blockchain (if exists)
 * 3. Complete or cancel the payment as appropriate
 */
export async function POST(request: Request) {
  try {
    const { payment } = await request.json();

    if (!payment) {
      return NextResponse.json(
        { error: "Missing payment data" },
        { status: 400 }
      );
    }

    const paymentId = payment.identifier;
    const txid = payment.transaction?.txid;
    const txURL = payment.transaction?._link;

    console.log("[Payments API] Handling incomplete payment:", paymentId);

    // In production with PI_API_KEY set:
    if (PI_API_KEY && txid) {
      // Find the incomplete order in your database
      // const order = await db.orders.findOne({ pi_payment_id: paymentId });

      // if (!order) {
      //   return NextResponse.json(
      //     { error: "Order not found" },
      //     { status: 400 }
      //   );
      // }

      // Verify the transaction on Pi blockchain
      if (txURL) {
        const horizonResponse = await fetch(txURL, { 
          signal: AbortSignal.timeout(20000) 
        });
        const txData = await horizonResponse.json();
        const paymentIdOnBlock = txData.memo;

        console.log("[Payments API] Blockchain verification:", paymentIdOnBlock);

        // Verify payment ID matches
        // if (paymentIdOnBlock !== order.pi_payment_id) {
        //   return NextResponse.json(
        //     { error: "Payment ID mismatch" },
        //     { status: 400 }
        //   );
        // }
      }

      // Mark the order as paid
      // await db.orders.update(
      //   { pi_payment_id: paymentId },
      //   { txid, paid: true }
      // );

      // Let Pi Servers know that the payment is completed
      await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, {
        txid,
      });

      return NextResponse.json({
        message: `Handled the incomplete payment ${paymentId}`,
      });
    }

    // Sandbox mode or no transaction
    console.log("[Payments API] Sandbox mode - logged incomplete payment");
    return NextResponse.json({
      message: `Logged incomplete payment ${paymentId}`,
    });
  } catch (error) {
    console.error("[Payments API] Incomplete payment error:", error);
    return NextResponse.json(
      { error: "Failed to handle incomplete payment" },
      { status: 500 }
    );
  }
}
