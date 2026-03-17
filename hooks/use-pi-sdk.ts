"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ============================================================================
// TYPE DEFINITIONS - Based on Pi Demo App (github.com/pi-apps/demo)
// ============================================================================

// PiRC-compliant Service Payment Metadata
export type MyPaymentMetadata = {
  network_provider: string;
  phone_number: string;
  data_plan_id: string;
  data_plan_size: string;
  order_id?: string;
  // PiRC Service Payment fields
  service_type?: string;
  provider_code?: string;
  recipient_identifier?: string;
  is_test_mode?: boolean;
};

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
    roles: string[];
  };
}

export type User = AuthResult["user"];

export interface PaymentDTO {
  amount: number;
  user_uid: string;
  created_at: string;
  identifier: string;
  metadata: MyPaymentMetadata;
  memo: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  to_address: string;
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: MyPaymentMetadata;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PaymentDTO) => void;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
  errorCode?: "INSUFFICIENT_BALANCE" | "NETWORK_BUSY" | "CANCELLED" | "UNKNOWN";
}

export interface TransactionReceipt {
  paymentId: string;
  txid: string;
  amount: number;
  network_provider: string;
  phone_number: string;
  data_plan_size: string;
  timestamp: Date;
  txLink?: string;
}

// Pi SDK Interface
interface PiSDK {
  init: (config: { version: string; sandbox: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PaymentDTO) => void
  ) => Promise<AuthResult>;
  createPayment: (
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => Promise<PaymentDTO>;
}

// Window extension for environment variables (following Pi Demo pattern)
interface WindowWithEnv extends Window {
  Pi?: PiSDK;
  __ENV?: {
    backendURL: string;
    sandbox: "true" | "false";
  };
}

declare const window: WindowWithEnv;

// ============================================================================
// CONFIGURATION
// ============================================================================

// Backend URL - in production, set via environment variable
const getBackendURL = (): string => {
  if (typeof window !== "undefined" && window.__ENV?.backendURL) {
    return window.__ENV.backendURL;
  }
  // Default to relative path for API routes
  return "";
};

// Sandbox mode - set to true for development/testing
const isSandboxMode = (): boolean => {
  if (typeof window !== "undefined" && window.__ENV?.sandbox) {
    return window.__ENV.sandbox === "true";
  }
  // Default to sandbox mode for development
  return true;
};

// ============================================================================
// API CLIENT - Following Pi Demo App structure
// ============================================================================

const createAPIClient = () => {
  const baseURL = getBackendURL();
  const timeout = 20000;

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  return {
    post: <T>(endpoint: string, data: unknown): Promise<T> =>
      request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: <T>(endpoint: string): Promise<T> =>
      request<T>(endpoint, { method: "GET" }),
  };
};

const apiClient = createAPIClient();

// ============================================================================
// PAYMENT STATUS
// ============================================================================

export type PaymentStatus =
  | "idle"
  | "authenticating"
  | "creating_payment"
  | "awaiting_approval"
  | "awaiting_completion"
  | "completed"
  | "failed"
  | "cancelled";

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UsePiSDKReturn {
  isSDKLoaded: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: User | null;
  accessToken: string | null;
  paymentStatus: PaymentStatus;
  lastReceipt: TransactionReceipt | null;
  incompletePayment: PaymentDTO | null;
  createPayment: (
    amount: number,
    memo: string,
    metadata: Omit<MyPaymentMetadata, "order_id">
  ) => Promise<PaymentResult>;
  authenticate: () => Promise<boolean>;
  resetPaymentStatus: () => void;
  signOut: () => void;
  handleIncompletePayment: () => Promise<void>;
}

// ============================================================================
// MAIN HOOK - Following Pi Demo App patterns
// ============================================================================

export function usePiSDK(): UsePiSDKReturn {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [lastReceipt, setLastReceipt] = useState<TransactionReceipt | null>(null);
  const [incompletePayment, setIncompletePayment] = useState<PaymentDTO | null>(null);

  // Keep track of current payment metadata for receipt generation
  const currentPaymentRef = useRef<{
    amount: number;
    metadata: MyPaymentMetadata;
  } | null>(null);

  // ============================================================================
  // LOAD PI SDK SCRIPT
  // ============================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already loaded
    if (window.Pi) {
      // Initialize SDK
      const sandboxMode = isSandboxMode();
      window.Pi.init({ version: "2.0", sandbox: sandboxMode });
      console.log(`[Pi SDK] Initialized (sandbox: ${sandboxMode})`);
      setIsSDKLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;

    script.onload = () => {
      if (window.Pi) {
        const sandboxMode = isSandboxMode();
        // Pi.init is synchronous in the official SDK
        window.Pi.init({ version: "2.0", sandbox: sandboxMode });
        console.log(`[Pi SDK] Loaded and initialized (sandbox: ${sandboxMode})`);
        setIsSDKLoaded(true);
      }
    };

    script.onerror = () => {
      console.error("[Pi SDK] Failed to load SDK script");
    };

    document.head.appendChild(script);
  }, []);

  // ============================================================================
  // INCOMPLETE PAYMENT HANDLER - Following Pi Demo App pattern
  // ============================================================================
  const onIncompletePaymentFound = useCallback((payment: PaymentDTO) => {
    console.log("[Pi SDK] onIncompletePaymentFound:", payment);
    setIncompletePayment(payment);

    // Notify backend about incomplete payment
    // In production, backend should verify and complete/cancel the payment
    apiClient
      .post("/api/payments/incomplete", { payment })
      .then(() => {
        console.log("[Pi SDK] Incomplete payment reported to server");
      })
      .catch((error) => {
        console.error("[Pi SDK] Failed to report incomplete payment:", error);
      });
  }, []);

  // Handle incomplete payment manually
  const handleIncompletePayment = useCallback(async () => {
    if (!incompletePayment) return;

    const paymentId = incompletePayment.identifier;
    const txid = incompletePayment.transaction?.txid;

    if (txid) {
      // Payment has transaction, try to complete it
      try {
        await apiClient.post("/api/payments/complete", { paymentId, txid });
        console.log("[Pi SDK] Incomplete payment completed");
        setIncompletePayment(null);
      } catch (error) {
        console.error("[Pi SDK] Failed to complete incomplete payment:", error);
      }
    } else {
      // No transaction, cancel it
      try {
        await apiClient.post("/api/payments/cancelled_payment", { paymentId });
        console.log("[Pi SDK] Incomplete payment cancelled");
        setIncompletePayment(null);
      } catch (error) {
        console.error("[Pi SDK] Failed to cancel incomplete payment:", error);
      }
    }
  }, [incompletePayment]);

  // ============================================================================
  // AUTHENTICATION - Following Pi Demo App pattern
  // ============================================================================
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!window.Pi) {
      console.error("[Pi SDK] SDK not loaded");
      return false;
    }

    if (isAuthenticated && user) {
      console.log("[Pi SDK] Already authenticated as:", user.username);
      return true;
    }

    setIsAuthenticating(true);

    try {
      // Scopes from Pi Demo App
      const scopes = ["username", "payments", "roles", "in_app_notifications"];
      const authResult: AuthResult = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      );

      // Sign in user on backend
      await signInUser(authResult);

      setUser(authResult.user);
      setAccessToken(authResult.accessToken);
      setIsAuthenticated(true);
      console.log("[Pi SDK] User authenticated:", authResult.user.username);
      return true;
    } catch (error) {
      console.error("[Pi SDK] Authentication failed:", error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticated, user, onIncompletePaymentFound]);

  // Sign in user on backend
  const signInUser = async (authResult: AuthResult): Promise<void> => {
    try {
      await apiClient.post("/api/user/signin", { authResult });
      console.log("[Pi SDK] User signed in on backend");
    } catch (error) {
      // In sandbox mode, backend may not be available - that's OK
      console.warn("[Pi SDK] Backend signin failed (OK in sandbox):", error);
    }
  };

  // Sign out user
  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    setIncompletePayment(null);

    // Sign out on backend
    apiClient.get("/api/user/signout").catch((error) => {
      console.warn("[Pi SDK] Backend signout failed:", error);
    });
  }, []);

  // ============================================================================
  // RESET PAYMENT STATUS
  // ============================================================================
  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus("idle");
  }, []);

  // ============================================================================
  // CREATE PAYMENT - Following Pi Demo App pattern exactly
  // ============================================================================
  const createPayment = useCallback(
    async (
      amount: number,
      memo: string,
      metadata: Omit<MyPaymentMetadata, "order_id">
    ): Promise<PaymentResult> => {
      if (!window.Pi) {
        return { success: false, error: "Pi SDK not loaded", errorCode: "UNKNOWN" };
      }

      if (!isAuthenticated || !user) {
        return { success: false, error: "User not authenticated", errorCode: "UNKNOWN" };
      }

      setPaymentStatus("creating_payment");

      // Generate order ID for tracking
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullMetadata: MyPaymentMetadata = {
        ...metadata,
        order_id: orderId,
      };

      // Store for receipt generation
      currentPaymentRef.current = { amount, metadata: fullMetadata };

      const paymentData: PiPaymentData = {
        amount,
        memo,
        metadata: fullMetadata,
      };

      return new Promise((resolve) => {
        // ============================================================================
        // PAYMENT CALLBACKS - Following Pi Demo App structure exactly
        // ============================================================================
        const callbacks: PiPaymentCallbacks = {
          // Called when payment is ready for server approval
          onReadyForServerApproval: (paymentId: string) => {
            console.log("[Pi SDK] onReadyForServerApproval:", paymentId);
            setPaymentStatus("awaiting_approval");

            // Call backend to approve payment
            // Backend should: 1. Create order record 2. Call Pi API /payments/{paymentId}/approve
            apiClient
              .post("/api/payments/approve", { paymentId })
              .then(() => {
                console.log("[Pi SDK] Payment approved by server");
              })
              .catch((error) => {
                console.error("[Pi SDK] Server approval failed:", error);
                // In sandbox mode, simulate approval
                if (isSandboxMode()) {
                  console.log("[Pi SDK] Sandbox: Simulating server approval");
                }
              });
          },

          // Called when blockchain transaction is complete
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log("[Pi SDK] onReadyForServerCompletion:", paymentId, txid);
            setPaymentStatus("awaiting_completion");

            // Call backend to complete payment
            // Backend should: 1. Update order 2. Call Pi API /payments/{paymentId}/complete
            apiClient
              .post("/api/payments/complete", { paymentId, txid })
              .then(() => {
                console.log("[Pi SDK] Payment completed by server");

                // Generate receipt
                const receipt: TransactionReceipt = {
                  paymentId,
                  txid,
                  amount: currentPaymentRef.current?.amount || amount,
                  network_provider:
                    currentPaymentRef.current?.metadata.network_provider ||
                    fullMetadata.network_provider,
                  phone_number:
                    currentPaymentRef.current?.metadata.phone_number ||
                    fullMetadata.phone_number,
                  data_plan_size:
                    currentPaymentRef.current?.metadata.data_plan_size ||
                    fullMetadata.data_plan_size,
                  timestamp: new Date(),
                  txLink: `https://pi-blockchain.net/tx/${txid}`,
                };

                setLastReceipt(receipt);
                setPaymentStatus("completed");
                resolve({ success: true, paymentId, txid });
              })
              .catch((error) => {
                console.error("[Pi SDK] Server completion failed:", error);

                // In sandbox mode, simulate completion
                if (isSandboxMode()) {
                  console.log("[Pi SDK] Sandbox: Simulating server completion");

                  const receipt: TransactionReceipt = {
                    paymentId,
                    txid,
                    amount: currentPaymentRef.current?.amount || amount,
                    network_provider:
                      currentPaymentRef.current?.metadata.network_provider ||
                      fullMetadata.network_provider,
                    phone_number:
                      currentPaymentRef.current?.metadata.phone_number ||
                      fullMetadata.phone_number,
                    data_plan_size:
                      currentPaymentRef.current?.metadata.data_plan_size ||
                      fullMetadata.data_plan_size,
                    timestamp: new Date(),
                    txLink: `https://pi-blockchain.net/tx/${txid}`,
                  };

                  setLastReceipt(receipt);
                  setPaymentStatus("completed");
                  resolve({ success: true, paymentId, txid });
                } else {
                  setPaymentStatus("failed");
                  resolve({
                    success: false,
                    error: "Server failed to complete payment",
                    errorCode: "NETWORK_BUSY",
                  });
                }
              });
          },

          // Called when user cancels payment
          onCancel: (paymentId: string) => {
            console.log("[Pi SDK] onCancel:", paymentId);
            setPaymentStatus("cancelled");

            // Notify backend about cancellation
            apiClient
              .post("/api/payments/cancelled_payment", { paymentId })
              .catch((error) => {
                console.warn("[Pi SDK] Failed to report cancellation:", error);
              });

            resolve({
              success: false,
              error: "Payment cancelled by user",
              errorCode: "CANCELLED",
            });
          },

          // Called on any error
          onError: (error: Error, payment?: PaymentDTO) => {
            console.error("[Pi SDK] onError:", error);
            if (payment) {
              console.log("[Pi SDK] Payment data:", payment);
            }

            setPaymentStatus("failed");

            // Detect specific error types
            const errorMessage = error.message?.toLowerCase() || "";
            let errorCode: PaymentResult["errorCode"] = "UNKNOWN";

            if (
              errorMessage.includes("insufficient") ||
              errorMessage.includes("balance")
            ) {
              errorCode = "INSUFFICIENT_BALANCE";
            } else if (
              errorMessage.includes("network") ||
              errorMessage.includes("timeout") ||
              errorMessage.includes("busy")
            ) {
              errorCode = "NETWORK_BUSY";
            }

            resolve({
              success: false,
              error: error.message,
              errorCode,
            });
          },
        };

        // ============================================================================
        // INITIATE PAYMENT
        // ============================================================================
        window
          .Pi!.createPayment(paymentData, callbacks)
          .then((payment) => {
            console.log("[Pi SDK] Payment created:", payment);
          })
          .catch((error) => {
            console.error("[Pi SDK] createPayment error:", error);
            setPaymentStatus("failed");

            const errorMessage = error.message?.toLowerCase() || "";
            let errorCode: PaymentResult["errorCode"] = "UNKNOWN";

            if (
              errorMessage.includes("insufficient") ||
              errorMessage.includes("balance")
            ) {
              errorCode = "INSUFFICIENT_BALANCE";
            } else if (
              errorMessage.includes("network") ||
              errorMessage.includes("timeout")
            ) {
              errorCode = "NETWORK_BUSY";
            }

            resolve({
              success: false,
              error: error.message || "Failed to create payment",
              errorCode,
            });
          });
      });
    },
    [isAuthenticated, user]
  );

  // ============================================================================
  // RETURN HOOK VALUES
  // ============================================================================
  return {
    isSDKLoaded,
    isAuthenticated,
    isAuthenticating,
    user,
    accessToken,
    paymentStatus,
    lastReceipt,
    incompletePayment,
    createPayment,
    authenticate,
    resetPaymentStatus,
    signOut,
    handleIncompletePayment,
  };
}
