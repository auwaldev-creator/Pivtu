"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
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
import { TransactionSuccess } from "@/components/dashboard/transaction-success";
import { ProcessingOverlay } from "@/components/dashboard/processing-overlay";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
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
  // State
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [vtuDelivery, setVtuDelivery] = useState<VTUDeliveryData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Pi SDK - Following Pi Demo App pattern
  const {
    isSDKLoaded,
    isAuthenticated,
    isAuthenticating,
    user,
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
        `Welcome, ${user?.username || "Pioneer"}! Your Pi wallet is now connected.`
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

  // Handle payment with real-time notifications
  const handlePayment = async () => {
    if (!isFormValid || !selectedPlan || !selectedNetwork) return;

    // Check balance
    if (selectedPlan.price > displayBalance) {
      showToast(
        "error",
        "Insufficient Pi Balance",
        `You need ${selectedPlan.price.toFixed(2)} Pi but only have ${displayBalance.toFixed(2)} Pi. Please top up your wallet.`
      );
      return;
    }

    // Show pending notification
    showToast(
      "info",
      "Processing Payment",
      `Initiating ${selectedPlan.size} data purchase for ${phoneNumber}...`
    );

    try {
      // Create payment with PiRC-compliant metadata
      const memo = `Pivtu - ${selectedPlan.size} for ${phoneNumber} (${selectedNetwork.toUpperCase()})`;

      // PiRC Service Payment metadata structure
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
        // Show delivery notification
        showToast(
          "info",
          "Delivering Data",
          "Payment successful! Delivering your data bundle..."
        );

        // Call VTU API to deliver data
        const delivery = await deliverData(result.paymentId, result.txid);
        setVtuDelivery(delivery);

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

        // Show success notification
        showToast(
          "success",
          "Transaction Complete",
          `${selectedPlan.size} data has been delivered to ${phoneNumber}!`
        );

        // Show success screen
        setShowSuccessScreen(true);

        // Reset form
        setSelectedNetwork(null);
        setPhoneNumber("");
        setSelectedPlan(null);
      } else {
        // Handle specific error codes
        switch (result.errorCode) {
          case "INSUFFICIENT_BALANCE":
            showToast(
              "error",
              "Insufficient Pi Balance",
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
            showToast(
              "info",
              "Payment Cancelled",
              "You cancelled the payment. No Pi has been deducted."
            );
            break;
          default:
            showToast(
              "error",
              "Payment Failed",
              result.error || "An error occurred. Please try again."
            );
        }
        resetPaymentStatus();
      }
    } catch (error) {
      console.error("[Payment] Error:", error);
      showToast(
        "error",
        "Payment Error",
        "An unexpected error occurred. Please try again later."
      );
      resetPaymentStatus();
    }
  };

  // Handle success screen close
  const handleSuccessDone = () => {
    setShowSuccessScreen(false);
    setVtuDelivery(null);
    resetPaymentStatus();
  };

  // Refresh wallet
  const handleRefreshWallet = useCallback(() => {
    refreshWalletBalance();
    showToast("info", "Refreshing Balance", "Fetching your latest Pi balance...");
  }, [showToast, refreshWalletBalance]);

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

  // Show success screen after payment
  if (showSuccessScreen && lastReceipt) {
    return (
      <TransactionSuccess
        receipt={lastReceipt}
        vtuDelivery={vtuDelivery || undefined}
        onDone={handleSuccessDone}
      />
    );
  }

  // Show transaction history
  if (showHistory) {
    return (
      <TransactionHistory
        transactions={transactions}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Processing Overlay */}
      <ProcessingOverlay
        status={paymentStatus}
        planSize={selectedPlan?.size}
        amount={selectedPlan?.price}
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

        {/* Quick Actions - Removed Admin button */}
        <section className="mt-6 grid grid-cols-4 gap-3">
          {[
            {
              icon: History,
              label: "History",
              color: "text-primary",
              onClick: () => setShowHistory(true),
            },
            {
              icon: HelpCircle,
              label: "Support",
              color: "text-[#F59E0B]",
              href: "#",
            },
            {
              icon: Shield,
              label: "Security",
              color: "text-success",
              href: "/settings",
            },
            {
              icon: Settings,
              label: "Settings",
              color: "text-muted-foreground",
              href: "/settings",
            },
          ].map(({ icon: Icon, label, color, href, onClick }) =>
            href && href !== "#" ? (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {label}
                </span>
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition-all hover:bg-secondary active:scale-95"
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {label}
                </span>
              </button>
            )
          )}
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

          {/* KYC Notice */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-success" />
            <p className="text-xs text-success">
              Verified by Pi Network KYC. No additional registration required.
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
          <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground/70">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
