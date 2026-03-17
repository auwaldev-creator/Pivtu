import { NextResponse } from "next/server";

// ============================================================================
// MOCK VTU API - PiRC Service Payment Compliance
// Simulates VTU data delivery with PiRC-aligned response structure
// ============================================================================

export interface VTUDeliveryRequest {
  payment_id: string;
  txid: string;
  network_provider: string;
  phone_number: string;
  data_plan_id: string;
  data_plan_size: string;
  amount_pi: number;
}

export interface VTUDeliveryResponse {
  status: "success" | "failed" | "pending";
  delivery_id: string;
  network: string;
  data_plan: string;
  phone_number: string;
  test_naira_balance: string;
  mock_token_delivery_id: string;
  timestamp: string;
  pi_transaction: {
    payment_id: string;
    txid: string;
    amount: number;
    explorer_link: string;
  };
  // PiRC-compliant metadata
  pirc_metadata: {
    service_type: "data_bundle";
    provider_code: string;
    recipient_identifier: string;
    service_description: string;
    fulfillment_status: "completed" | "pending" | "failed";
    processing_time_ms: number;
  };
}

// Mock naira balance (simulating business wallet)
let mockNairaBalance = 10000;

// Data plan prices in mock naira
const dataPlanPricesNaira: Record<string, number> = {
  "500mb": 150,
  "1gb": 250,
  "2gb": 450,
  "5gb": 1000,
};

export async function POST(request: Request) {
  try {
    const body: VTUDeliveryRequest = await request.json();

    const {
      payment_id,
      txid,
      network_provider,
      phone_number,
      data_plan_id,
      data_plan_size,
      amount_pi,
    } = body;

    // Simulate processing delay (1-2 seconds)
    const processingStart = Date.now();
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );
    const processingTime = Date.now() - processingStart;

    // Generate delivery ID
    const deliveryId = `VTU_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    const mockTokenDeliveryId = `TKN_${network_provider.toUpperCase()}_${Date.now()}`;

    // Calculate naira cost
    const nairaCost = dataPlanPricesNaira[data_plan_id] || 200;
    mockNairaBalance -= nairaCost;

    // Build PiRC-compliant response
    const response: VTUDeliveryResponse = {
      status: "success",
      delivery_id: deliveryId,
      network: network_provider.toUpperCase(),
      data_plan: data_plan_size,
      phone_number: phone_number,
      test_naira_balance: mockNairaBalance.toFixed(2),
      mock_token_delivery_id: mockTokenDeliveryId,
      timestamp: new Date().toISOString(),
      pi_transaction: {
        payment_id,
        txid,
        amount: amount_pi,
        explorer_link: `https://piblockexplorer.com/tx/${txid}`,
      },
      // PiRC Service Payment Metadata
      pirc_metadata: {
        service_type: "data_bundle",
        provider_code: network_provider.toUpperCase(),
        recipient_identifier: phone_number,
        service_description: `${data_plan_size} Data Bundle - ${network_provider.toUpperCase()}`,
        fulfillment_status: "completed",
        processing_time_ms: processingTime,
      },
    };

    console.log("[Mock VTU] Data delivered:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Mock VTU] Delivery error:", error);
    return NextResponse.json(
      {
        status: "failed",
        error: "Failed to process data delivery",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check mock balance
export async function GET() {
  return NextResponse.json({
    test_naira_balance: mockNairaBalance.toFixed(2),
    currency: "NGN (Mock)",
    last_updated: new Date().toISOString(),
  });
}
