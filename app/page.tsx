"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { WalletCard } from "@/components/dashboard/wallet-card";
import {
  NetworkSelector,
  type NetworkProvider,
} from "@/components/dashboard/network-selector";
import { PhoneInput } from "@/components/dashboard/phone-input";
import {
  DataPlanSelector,
  type DataPlan,
} from "@/components/dashboard/data-plan-selector";
import { PayButton } from "@/components/dashboard/pay-button";
import {
  NotificationToast,
  type NotificationType,
} from "@/components/dashboard/notification-toast";
import { ConnectWallet } from "@/components/dashboard/connect-wallet";
import { TransactionStatusModal } from "@/components/dashboard/transaction-status-modal";
import { usePiSDK } from "@/hooks/use-pi-sdk";
import {
  History,
  HelpCircle,
  Shield,
  AlertTriangle,
  Settings,
} from "lucide-react";

const dataPlans: DataPlan[] = [
  { id: "500mb", size: "500MB", price: 0.5, validity: "30 Days" },
  { id: "1gb", size: "1GB", price: 0.9, validity: "30 Days", popular: true },
  { id: "2gb", size: "2GB", price: 1.7, validity: "30 Days" },
  { id: "5gb", size: "5GB", price: 4.0, validity: "30 Days" },
];

interface Notification {
  type: NotificationType;
  title: string;
  message: string;
}

interface VTUDeliveryData {
  delivery_id: string;
  mock_token_delivery_id: string;
  test_naira_balance: string;
}

// Transaction interface for history
export interface Transaction {
  id: string;
  txid: string;
  amount: number;
  network_provider: string;
  phone_number: string;
  data_plan_size: string;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
}

export default function VTUDashboard() {
  const router = useRouter();
  
  // State
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [lastTxid, setLastTxid] = useState<string | undefined>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Pi SDK
  const {
    isSDKLoaded,
    isAuthenticated,
    isAuthenticating,
    user,
    walletAddress,
    walletBalance,
    paymentStatus,
    incompletePayment,
    createPayment,
    authenticate,
    resetPaymentStatus,
    signOut,
    handleIncompletePayment,
    refreshWalletBalance,
  } = usePiSDK();

  // Use wallet balance from Pi SDK or default to 0
  const displayBalance = walletBalance ?? 0;

  // Derived state
  const phoneError =
    phoneNumber.length > 0 && phoneNumber.length < 11
      ? "Please enter a valid 11-digit phone number"
      : "";

  const isFormValid =
    selectedNetwork && phoneNumber.length === 11 && selectedPlan;

  const isProcessing =
    paymentStatus !== "idle" &&
    paymentStatus !== "completed" &&
    paymentStatus !== "failed" &&
    paymentStatus !== "cancelled";

  // Load transactions from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && user?.uid) {
      const savedTransactions = localStorage.getItem(`transactions_${user.uid}`);
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        setTransactions(
          parsed.map((t: Transaction) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          }))
        );
      }
    }
  }, [user?.uid]);

  // Save transactions to localStorage
  const saveTransaction = useCallback(
    (transaction: Transaction) => {
      if (typeof window !== "undefined" && user?.uid) {
        const updatedTransactions = [transaction, ...transactions];
        setTransactions(updatedTransactions);
        localStorage.setItem(
          `transactions_${user.uid}`,
          JSON.stringify(updatedTransactions)
        );
      }
    },
    [transactions, user?.uid]
  );

  // Show notification helper
  const showToast = useCallback(
    (type: NotificationType, title: string, message: string) => {
      setNotification({ type, title, message });
      setShowNotification(true);
    },
    []
  );

  // Handle wallet connection
  const handleConnectWallet = async () => {
    const success = await authenticate();
    if (success) {
      showToast(
        "success",
        "Wallet Connected",
        `Welcome, ${user?.username || "Pioneer"}!`
      );
    } else {
      showToast(
        "error",
        "Connection Failed",
        "Unable to connect to Pi wallet. Please try again."
      );
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    showToast("info", "Signed Out", "You have been signed out successfully.");
  };

  // Handle incomplete payment
  const handleResumeIncompletePayment = async () => {
    if (incompletePayment) {
      await handleIncompletePayment();
      showToast(
        "info",
        "Payment Processed",
        "Your incomplete payment has been processed."
      );
    }
  };

  // Call VTU API to deliver data
  const deliverData = async (
    paymentId: string,
    txid: string
  ): Promise<VTUDeliveryData | null> => {
    if (!selectedNetwork || !selectedPlan) return null;

    try {
      const response = await fetch("/api/vtu/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          txid: txid,
          network_provider: selectedNetwork,
          phone_number: phoneNumber,
          data_plan_id: selectedPlan.id,
          data_plan_size: selectedPlan.size,
          amount_pi: selectedPlan.price,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        return {
          delivery_id: data.delivery_id,
          mock_token_delivery_id: data.mock_token_delivery_id,
          test_naira_balance: data.test_naira_balance,
        };
      }
      return null;
    } catch (error) {
      console.error("[VTU] Delivery failed:", error);
      return null;
    }
  };

  // Handle payment with real-time modal
  const handlePayment = async () => {
    if (!isFormValid || !selectedPlan || !selectedNetwork) return;

    // Check balance
    if (selectedPlan.price > displayBalance) {
      showToast(
        "error",
        "Insufficient Balance",
        `You need ${selectedPlan.price.toFixed(2)} Pi but only have ${displayBalance.toFixed(2)} Pi.`
      );
      return;
    }

    // Show transaction modal
    setShowTransactionModal(true);

    try {
      const memo = `Pivtu - ${selectedPlan.size} for ${phoneNumber} (${selectedNetwork.toUpperCase()})`;

      const result = await createPayment(selectedPlan.price, memo, {
        network_provider: selectedNetwork,
        phone_number: phoneNumber,
        data_plan_id: selectedPlan.id,
        data_plan_size: selectedPlan.size,
        service_type: "data_bundle",
        provider_code: selectedNetwork.toUpperCase(),
        recipient_identifier: phoneNumber,
      });

      if (result.success && result.paymentId && result.txid) {
        setLastTxid(result.txid);

        // Call VTU API to deliver data
        await deliverData(result.paymentId, result.txid);

        // Save transaction to history
        saveTransaction({
          id: result.paymentId,
          txid: result.txid,
          amount: selectedPlan.price,
          network_provider: selectedNetwork,
          phone_number: phoneNumber,
          data_plan_size: selectedPlan.size,
          status: "completed",
          timestamp: new Date(),
        });

        // Refresh wallet balance
        refreshWalletBalance();

        // Reset form after success
        setTimeout(() => {
          setSelectedNetwork(null);
          setPhoneNumber("");
          setSelectedPlan(null);
        }, 1000);
      } else {
        // Handle specific error codes
        switch (result.errorCode) {
          case "INSUFFICIENT_BALANCE":
            showToast(
              "error",
              "Insufficient Balance",
              "You don't have enough Pi to complete this transaction."
            );
            break;
          case "NETWORK_BUSY":
            showToast(
              "warning",
              "Network Busy",
              "The Pi Network is experiencing high traffic. Please try again."
            );
            break;
          case "CANCELLED":
            // Modal will show cancelled state
            break;
          default:
            showToast(
              "error",
              "Payment Failed",
              result.error || "An error occurred. Please try again."
            );
        }
      }
    } catch (error) {
      console.error("[Payment] Error:", error);
      showToast(
        "error",
        "Payment Error",
        "An unexpected error occurred. Please try again."
      );
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowTransactionModal(false);
    setLastTxid(undefined);
    resetPaymentStatus();
  };

  // Refresh wallet
  const handleRefreshWallet = useCallback(() => {
    refreshWalletBalance();
    showToast("info", "Refreshing", "Fetching your latest Pi balance...");
  }, [showToast, refreshWalletBalance]);

  // Navigate to settings
  const handleNavigateToSettings = () => {
    router.push("/settings");
  };

  // Navigate to history
  const handleNavigateToHistory = () => {
    router.push("/settings");
  };

  // Show wallet connection screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <NotificationToast
          type={notification?.type || "info"}
          title={notification?.title || ""}
          message={notification?.message || ""}
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
        />
        <ConnectWallet
          isSDKLoaded={isSDKLoaded}
          isConnecting={isAuthenticating}
          onConnect={handleConnectWallet}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Transaction Status Modal */}
      <TransactionStatusModal
        isOpen={showTransactionModal}
        status={paymentStatus}
        planSize={selectedPlan?.size}
        amount={selectedPlan?.price}
        txid={lastTxid}
        phoneNumber={phoneNumber}
        networkProvider={selectedNetwork || undefined}
        onClose={handleModalClose}
      />

      {/* Notification Toast */}
      <NotificationToast
        type={notification?.type || "info"}
        title={notification?.title || ""}
        message={notification?.message || ""}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      {/* Header with Sign Out */}
      <Header onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="px-4 pb-8">
        {/* Incomplete Payment Alert */}
        {incompletePayment && (
          <section className="mt-4 mb-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#F59E0B]/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Incomplete Payment Found
                </p>
                <p className="text-xs text-muted-foreground">
                  You have an unfinished payment from a previous session.
                </p>
              </div>
              <button
                onClick={handleResumeIncompletePayment}
                className="rounded-lg bg-[#F59E0B] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#F59E0B]/90"
              >
                Resume
              </button>
            </div>
          </section>
        )}

        {/* Wallet Card */}
        <section className="mt-4">
          <WalletCard
            balance={displayBalance}
            username={user?.username || "Pioneer"}
            walletAddress={walletAddress}
            onRefresh={handleRefreshWallet}
          />
        </section>

        {/* Quick Actions */}
        <section className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={handleNavigateToHistory}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
          >
            <History className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">
              History
            </span>
          </button>
          <button
            onClick={() => showToast("info", "Support", "Contact us at support@pivtu.com")}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
          >
            <HelpCircle className="h-5 w-5 text-[#F59E0B]" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Support
            </span>
          </button>
          <button
            onClick={handleNavigateToSettings}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
          >
            <Shield className="h-5 w-5 text-success" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Security
            </span>
          </button>
          <button
            onClick={handleNavigateToSettings}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Settings
            </span>
          </button>
        </section>

        {/* Quick Recharge Form */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Quick Recharge</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Instant
            </span>
          </div>

          <div className="space-y-6 rounded-2xl bg-card p-5 shadow-xl shadow-black/5">
            {/* Network Selector */}
            <NetworkSelector
              selected={selectedNetwork}
              onSelect={setSelectedNetwork}
            />

            {/* Phone Input */}
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              error={phoneError}
            />

            {/* Data Plan Selector */}
            <DataPlanSelector
              plans={dataPlans}
              selected={selectedPlan}
              onSelect={setSelectedPlan}
            />
          </div>
        </section>

        {/* Summary & Pay Button */}
        <section className="mt-6">
          {selectedPlan && (
            <div className="mb-4 rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Data Plan</span>
                <span className="font-medium text-foreground">
                  {selectedPlan.size}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Validity</span>
                <span className="font-medium text-foreground">
                  {selectedPlan.validity}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">
                  {selectedPlan.price.toFixed(2)} Pi
                </span>
              </div>
            </div>
          )}

          <PayButton
            amount={selectedPlan?.price || 0}
            disabled={!isFormValid || isProcessing}
            loading={isProcessing}
            onClick={handlePayment}
          />

          {/* Security Notice */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-success" />
            <p className="text-xs text-success">
              Secured by Pi Network. Your transactions are safe.
            </p>
          </div>

          {/* Connected Status */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              Connected as @{user?.username}
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-primary">Pi Network</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
