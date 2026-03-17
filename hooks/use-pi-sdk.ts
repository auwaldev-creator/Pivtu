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
    credentials?: {
      scopes: string[];
      valid_until: { timestamp: number; iso8601: string };
    };
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
  walletAddress: string | null;
  walletBalance: number | null;
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
  refreshWalletBalance: () => Promise<void>;
}

// ============================================================================
// MAIN HOOK - Following Pi Demo App patterns
// ============================================================================

// Session storage keys
const SESSION_KEY = "pivtu_session";
const SESSION_EXPIRY_KEY = "pivtu_session_expiry";

// Session duration: until tab is closed (sessionStorage) or 24 hours for localStorage fallback
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

interface StoredSession {
  user: User;
  accessToken: string;
  walletAddress: string | null;
  walletBalance: number | null;
}

export function usePiSDK(): UsePiSDKReturn {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [lastReceipt, setLastReceipt] = useState<TransactionReceipt | null>(null);
  const [incompletePayment, setIncompletePayment] = useState<PaymentDTO | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Keep track of current payment metadata for receipt generation
  const currentPaymentRef = useRef<{
    amount: number;
    metadata: MyPaymentMetadata;
  } | null>(null);

  // ============================================================================
  // SESSION PERSISTENCE - Restore session on mount
  // ============================================================================
  useEffect(() => {
    if (typeof window === "undefined" || sessionRestored) return;

    try {
      // Try sessionStorage first (persists until tab closes)
      let storedSession = sessionStorage.getItem(SESSION_KEY);
      let expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);

      // Fallback to localStorage if session not in sessionStorage
      if (!storedSession) {
        storedSession = localStorage.getItem(SESSION_KEY);
        expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      }

      if (storedSession && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          const session: StoredSession = JSON.parse(storedSession);
          setUser(session.user);
          setAccessToken(session.accessToken);
          setWalletAddress(session.walletAddress);
          setWalletBalance(session.walletBalance);
          setIsAuthenticated(true);
          console.log("[Pi SDK] Session restored for:", session.user.username);
        } else {
          // Session expired, clear it
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_EXPIRY_KEY);
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(SESSION_EXPIRY_KEY);
          console.log("[Pi SDK] Session expired, cleared");
        }
      }
    } catch (error) {
      console.warn("[Pi SDK] Failed to restore session:", error);
    }

    setSessionRestored(true);
  }, [sessionRestored]);

  // Save session whenever auth state changes
  useEffect(() => {
    if (typeof window === "undefined" || !sessionRestored) return;

    if (isAuthenticated && user && accessToken) {
      const session: StoredSession = {
        user,
        accessToken,
        walletAddress,
        walletBalance,
      };
      const expiry = (Date.now() + SESSION_DURATION_MS).toString();

      try {
        // Store in both sessionStorage and localStorage
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(SESSION_EXPIRY_KEY, expiry);
        console.log("[Pi SDK] Session saved");
      } catch (error) {
        console.warn("[Pi SDK] Failed to save session:", error);
      }
    }
  }, [isAuthenticated, user, accessToken, walletAddress, walletBalance, sessionRestored]);

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
      // This is expected when not running in Pi Browser
      // The Pi SDK can only be loaded within the Pi Browser environment
      console.warn("[Pi SDK] SDK not available - this app must be opened in Pi Browser");
      setIsSDKLoaded(false);
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
      // Scopes from Pi Demo App - include wallet_address for balance lookup
      const scopes = ["username", "payments", "roles", "wallet_address"];
      const authResult = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      );

      // Sign in user on backend and get wallet address
      const signInResponse = await signInUser(authResult);

      setUser(authResult.user);
      setAccessToken(authResult.accessToken);
      
      // Set wallet address from sign-in response or auth result
      if (signInResponse?.walletAddress) {
        setWalletAddress(signInResponse.walletAddress);
      }
      
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
  const signInUser = async (authResult: AuthResult): Promise<{ walletAddress?: string } | null> => {
    try {
      const response = await apiClient.post<{ walletAddress?: string }>("/api/user/signin", { authResult });
      console.log("[Pi SDK] User signed in on backend");
      return response;
    } catch (error) {
      // In sandbox mode, backend may not be available - that's OK
      console.warn("[Pi SDK] Backend signin failed (OK in sandbox):", error);
      return null;
    }
  };

  // Sign out user
  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setWalletAddress(null);
    setWalletBalance(null);
    setIsAuthenticated(false);
    setIncompletePayment(null);

    // Clear stored session
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch (error) {
      console.warn("[Pi SDK] Failed to clear session:", error);
    }

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
                  txLink: `https://blockexplorer.minepi.com/testnet/tx/${txid}`,
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
                    txLink: `https://blockexplorer.minepi.com/testnet/tx/${txid}`,
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
  // WALLET BALANCE - Fetch from Pi Testnet BlockExplorer API
  // ============================================================================
  const refreshWalletBalance = useCallback(async (): Promise<void> => {
    if (!walletAddress) {
      console.log("[Pi SDK] No wallet address to fetch balance");
      return;
    }

    try {
      // Fetch balance from Pi Testnet Horizon API
      const response = await fetch(
        `https://api.testnet.minepi.com/accounts/${walletAddress}`
      );

      if (response.ok) {
        const data = await response.json();
        // Find the native Pi balance
        const nativeBalance = data.balances?.find(
          (b: { asset_type: string }) => b.asset_type === "native"
        );
        if (nativeBalance) {
          setWalletBalance(parseFloat(nativeBalance.balance));
          console.log("[Pi SDK] Wallet balance updated:", nativeBalance.balance);
        }
      } else if (response.status === 404) {
        // Account not found on testnet, set balance to 0
        setWalletBalance(0);
        console.log("[Pi SDK] Account not found on testnet, balance set to 0");
      } else {
        console.error("[Pi SDK] Failed to fetch balance:", response.status);
      }
    } catch (error) {
      console.error("[Pi SDK] Error fetching wallet balance:", error);
    }
  }, [walletAddress]);

  // Auto-refresh balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      refreshWalletBalance();
    }
  }, [walletAddress, refreshWalletBalance]);

  // ============================================================================
  // RETURN HOOK VALUES
  // ============================================================================
  return {
    isSDKLoaded,
    isAuthenticated,
    isAuthenticating,
    user,
    accessToken,
    walletAddress,
    walletBalance,
    paymentStatus,
    lastReceipt,
    incompletePayment,
    createPayment,
    authenticate,
    resetPaymentStatus,
    signOut,
    handleIncompletePayment,
    refreshWalletBalance,
  };
}
