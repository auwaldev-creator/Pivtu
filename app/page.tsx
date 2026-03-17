"use client";

import { useState, useCallback } from "react";
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
import { TestModeToggle } from "@/components/dashboard/test-mode-toggle";
import { usePiSDK } from "@/hooks/use-pi-sdk";
import {
  History,
  HelpCircle,
  Shield,
  AlertTriangle,
  Settings,
  TestTube,
  ShieldCheck,
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

export default function VTUDashboard() {
  // State
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [walletBalance, setWalletBalance] = useState(125.75);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true); // Default to test mode
  const [vtuDelivery, setVtuDelivery] = useState<VTUDeliveryData | null>(null);

  // Pi SDK - Following Pi Demo App pattern
  const {
    isSDKLoaded,
    isAuthenticated,
    isAuthenticating,
    user,
    paymentStatus,
    lastReceipt,
    incompletePayment,
    createPayment,
    authenticate,
    resetPaymentStatus,
    signOut,
    handleIncompletePayment,
  } = usePiSDK();

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

  // Call Mock VTU API to deliver data
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

  // Handle payment - Following Pi Demo App orderProduct pattern with PiRC metadata
  const handlePayment = async () => {
    if (!isFormValid || !selectedPlan || !selectedNetwork) return;

    // Check balance
    if (selectedPlan.price > walletBalance) {
      showToast(
        "error",
        "Insufficient Pi Balance",
        `You need ${selectedPlan.price.toFixed(2)} Pi but only have ${walletBalance.toFixed(2)} Pi. Please top up your wallet.`
      );
      return;
    }

    try {
      // Create payment with PiRC-compliant metadata
      const memo = `Data Hub - ${selectedPlan.size} for ${phoneNumber} (${selectedNetwork.toUpperCase()})`;

      // PiRC Service Payment metadata structure
      const result = await createPayment(selectedPlan.price, memo, {
        network_provider: selectedNetwork,
        phone_number: phoneNumber,
        data_plan_id: selectedPlan.id,
        data_plan_size: selectedPlan.size,
        // PiRC additional fields
        service_type: "data_bundle",
        provider_code: selectedNetwork.toUpperCase(),
        recipient_identifier: phoneNumber,
        is_test_mode: isTestMode,
      });

      if (result.success && result.paymentId && result.txid) {
        // Call Mock VTU API to deliver data
        const delivery = await deliverData(result.paymentId, result.txid);
        setVtuDelivery(delivery);

        // Update wallet balance
        setWalletBalance((prev) => prev - selectedPlan.price);

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
              "You don't have enough Pi to complete this transaction. Please top up your wallet."
            );
            break;
          case "NETWORK_BUSY":
            showToast(
              "warning",
              "Network Busy",
              "The Pi Network is currently experiencing high traffic. Please try again in a few moments."
            );
            break;
          case "CANCELLED":
            showToast(
              "info",
              "Payment Cancelled",
              "You cancelled the payment. No Pi has been deducted from your wallet."
            );
            break;
          default:
            showToast(
              "error",
              "Payment Failed",
              result.error || "An error occurred during payment. Please try again."
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
    setTimeout(() => {
      showToast("info", "Wallet Updated", "Your balance has been refreshed.");
    }, 1000);
  }, [showToast]);

  // Handle test mode toggle
  const handleTestModeToggle = (enabled: boolean) => {
    setIsTestMode(enabled);
    showToast(
      "info",
      enabled ? "Test Mode Enabled" : "Live Mode Enabled",
      enabled
        ? "All transactions will use Test Pi and Mock Naira."
        : "Transactions will use real Pi. Be careful!"
    );
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
      <Header />

      {/* Main Content */}
      <main className="px-4 pb-8">
        {/* Test Mode Toggle */}
        <section className="mt-2 mb-4">
          <TestModeToggle
            isTestMode={isTestMode}
            onToggle={handleTestModeToggle}
          />
        </section>

        {/* Test Mode Banner */}
        {isTestMode && (
          <section className="mb-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-3">
              <TestTube className="h-5 w-5 shrink-0 text-[#F59E0B]" />
              <p className="text-xs text-[#F59E0B]">
                Test Mode Active - Using Test Pi & Mock Naira. No real
                transactions.
              </p>
            </div>
          </section>
        )}

        {/* Incomplete Payment Alert */}
        {incompletePayment && (
          <section className="mb-4">
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
        <section className="mt-2">
          <WalletCard
            balance={walletBalance}
            username={user?.username || "Pioneer"}
            onRefresh={handleRefreshWallet}
          />
        </section>

        {/* Quick Actions */}
        <section className="mt-6 grid grid-cols-5 gap-2">
          {[
            {
              icon: History,
              label: "History",
              color: "text-primary",
              href: "/settings",
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
            {
              icon: ShieldCheck,
              label: "Admin",
              color: "text-primary",
              href: "/admin",
            },
          ].map(({ icon: Icon, label, color, href }) =>
            href !== "#" ? (
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
                onClick={label === "Sign Out" ? handleSignOut : undefined}
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
              {isTestMode && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium text-[#F59E0B]">
                    Test (Mock Naira)
                  </span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">
                  {selectedPlan.price.toFixed(2)} {isTestMode ? "Test Pi" : "Pi"}
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

          {/* SDK Status indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              Connected as @{user?.username}{" "}
              {isTestMode ? "(Sandbox/Test Mode)" : "(Mainnet)"}
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-primary">Pi Network</span>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            {isTestMode
              ? "Testnet Environment - For Development Only"
              : "Mainnet - Live Transactions"}
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground/50">
            PiRC Service Payment Compliant
          </p>
        </footer>
      </main>
    </div>
  );
}
