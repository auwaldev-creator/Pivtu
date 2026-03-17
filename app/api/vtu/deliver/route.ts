import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// ============================================================================
// VTU API - Production-Ready Structure
// Replace the placeholder VTU_API calls with your actual VTU provider
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
  timestamp: string;
  pi_transaction: {
    payment_id: string;
    txid: string;
    amount: number;
    explorer_link: string;
  };
  vtu_response?: {
    reference: string;
    status: string;
    message: string;
  };
}

// Data plan prices in Naira (adjust based on your VTU provider)
const dataPlanPricesNaira: Record<string, number> = {
  "500mb": 150,
  "1gb": 250,
  "2gb": 450,
  "5gb": 1000,
};

// Network provider codes for VTU API
const networkCodes: Record<string, string> = {
  mtn: "MTN",
  airtel: "AIRTEL",
  glo: "GLO",
  "9mobile": "9MOBILE",
};

/**
 * Call your actual VTU provider API here
 * Replace this placeholder with your VTU provider integration
 * 
 * Example providers:
 * - VTPass (vtpass.com)
 * - AirtimePlug
 * - Gsubz
 * - Baxi (baxi.ng)
 * - ReloadlyCommerce
 */
async function callVTUProvider(
  networkProvider: string,
  phoneNumber: string,
  dataPlanId: string,
  _dataPlanSize: string
): Promise<{
  success: boolean;
  reference?: string;
  message: string;
}> {
  // ============================================================================
  // PLACEHOLDER: Replace with actual VTU API call
  // ============================================================================
  // 
  // Example VTPass integration:
  // const response = await fetch('https://vtpass.com/api/pay', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'api-key': process.env.VTPASS_API_KEY,
  //     'secret-key': process.env.VTPASS_SECRET_KEY,
  //   },
  //   body: JSON.stringify({
  //     request_id: `pivtu_${Date.now()}`,
  //     serviceID: `${networkProvider.toLowerCase()}-data`,
  //     billersCode: phoneNumber,
  //     variation_code: dataPlanId,
  //     amount: dataPlanPricesNaira[dataPlanId],
  //     phone: phoneNumber,
  //   }),
  // });
  // 
  // const data = await response.json();
  // return {
  //   success: data.code === '000',
  //   reference: data.requestId,
  //   message: data.response_description,
  // };
  // ============================================================================

  // Simulate VTU API response for testing
  const processingTime = 1000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const reference = `VTU_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  console.log(`[VTU] Processing ${_dataPlanSize} data for ${phoneNumber} on ${networkProvider}`);
  console.log(`[VTU] Plan ID: ${dataPlanId}, Naira Cost: ${dataPlanPricesNaira[dataPlanId] || 200}`);

  return {
    success: true,
    reference,
    message: `Data bundle delivered to ${phoneNumber}`,
  };
}

export async function POST(request: Request) {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

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

    // Validate required fields
    if (!payment_id || !txid || !network_provider || !phone_number || !data_plan_id) {
      return NextResponse.json(
        { status: "failed", error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate network provider
    const normalizedNetwork = network_provider.toLowerCase();
    if (!networkCodes[normalizedNetwork]) {
      return NextResponse.json(
        { status: "failed", error: "Invalid network provider" },
        { status: 400 }
      );
    }

    // Call VTU provider
    const vtuResult = await callVTUProvider(
      normalizedNetwork,
      phone_number,
      data_plan_id,
      data_plan_size
    );

    if (!vtuResult.success) {
      console.error("[VTU] Delivery failed:", vtuResult.message);
      return NextResponse.json({
        status: "failed",
        error: vtuResult.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Build response
    const response: VTUDeliveryResponse = {
      status: "success",
      delivery_id: vtuResult.reference || `VTU_${Date.now()}`,
      network: networkCodes[normalizedNetwork],
      data_plan: data_plan_size,
      phone_number: phone_number,
      timestamp: new Date().toISOString(),
      pi_transaction: {
        payment_id,
        txid,
        amount: amount_pi,
        explorer_link: `https://blockexplorer.minepi.com/testnet/tx/${txid}`,
      },
      vtu_response: {
        reference: vtuResult.reference || "",
        status: "delivered",
        message: vtuResult.message,
      },
    };

    // For backwards compatibility with existing code
    const legacyResponse = {
      ...response,
      mock_token_delivery_id: vtuResult.reference,
      test_naira_balance: "N/A", // No longer tracking mock balance
    };

    console.log("[VTU] Data delivered:", response.delivery_id);
    return NextResponse.json(legacyResponse);
  } catch (error) {
    console.error("[VTU] Delivery error:", error);
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

// GET endpoint - Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "VTU API endpoint is available",
    supported_networks: Object.keys(networkCodes),
    timestamp: new Date().toISOString(),
  });
}
