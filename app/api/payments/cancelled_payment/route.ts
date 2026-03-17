import { NextResponse } from "next/server";

/**
 * POST /api/payments/cancelled_payment
 * 
 * Handle cancelled payment - Following Pi Demo App pattern
 * 
 * This endpoint is called when a user cancels a payment.
 * 
 * In production, you should:
 * 1. Find the order in your database
 * 2. Mark it as cancelled
 * 3. Release any reserved inventory
 */
export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing paymentId" },
        { status: 400 }
      );
    }

    console.log("[Payments API] Payment cancelled:", paymentId);

    // TODO: In production, update your database
    // await db.orders.update(
    //   { pi_payment_id: paymentId },
    //   { cancelled: true }
    // );

    return NextResponse.json({
      message: `Cancelled the payment ${paymentId}`,
    });
  } catch (error) {
    console.error("[Payments API] Cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to record cancellation" },
      { status: 500 }
    );
  }
}
