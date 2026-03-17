"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  History,
  Shield,
  Copy,
  ExternalLink,
  RefreshCw,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePiSDK } from "@/hooks/use-pi-sdk";

// Transaction type for history
interface Transaction {
  id: string;
  type: "data_purchase";
  network: string;
  phone_number: string;
  data_plan: string;
  amount_pi: number;
  status: "success" | "failed" | "pending";
  txid: string;
  delivery_id: string;
  timestamp: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    user, 
    walletAddress, 
    walletBalance,
    signOut,
    refreshWalletBalance,
  } = usePiSDK();
  
  const [copied, setCopied] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Load transactions from localStorage
    if (user?.uid) {
      const savedTransactions = localStorage.getItem(`transactions_${user.uid}`);
      if (savedTransactions) {
        try {
          const parsed = JSON.parse(savedTransactions);
          setTransactions(parsed.map((t: Transaction) => ({
            ...t,
            timestamp: t.timestamp,
          })));
        } catch {
          console.error("Failed to parse transactions");
        }
      }
    }
    setIsLoading(false);
  }, [user?.uid]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const formatTxId = (txid: string) => {
    if (txid.length <= 16) return txid;
    return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[#F59E0B]" />;
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refreshWalletBalance();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleBack = () => {
    router.push("/");
  };

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* User Profile Section */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Pi Account
            </h2>
          </div>

          <div className="rounded-2xl bg-card p-5 space-y-4">
            {/* Username */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="font-medium text-foreground">
                @{user?.username || "Pioneer"}
              </span>
            </div>

            {/* Pi UID */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pi UID</span>
                <button
                  onClick={() => copyToClipboard(user?.uid || "", "uid")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Copy className="h-3 w-3" />
                  {copied === "uid" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="font-mono text-xs text-foreground break-all bg-secondary/50 rounded-lg p-2">
                {user?.uid || "Not available"}
              </p>
            </div>

            {/* KYC Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">KYC Status</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Wallet Section */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Wallet
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-primary/80 mb-1">Pi Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {(walletBalance ?? 0).toFixed(4)} Pi
                </p>
              </div>
              <button
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 transition-colors hover:bg-primary/30",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw className="h-5 w-5 text-primary" />
              </button>
            </div>

            {/* Wallet Address */}
            {walletAddress && (
              <div className="border-t border-primary/20 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Wallet Address</span>
                  <button
                    onClick={() => copyToClipboard(walletAddress, "wallet")}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === "wallet" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="font-mono text-xs text-foreground break-all bg-background/50 rounded-lg p-2">
                  {walletAddress}
                </p>
                <a
                  href={`https://blockexplorer.minepi.com/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary/20 py-2 text-sm font-medium text-primary hover:bg-primary/30"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on BlockExplorer
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Transaction History */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Recent Transactions
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-2xl bg-card p-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-10 text-center">
              <History className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Your purchase history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-xl bg-card p-4 transition-colors hover:bg-card/80"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className="font-medium text-foreground">
                        {tx.data_plan} - {tx.network}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      -{tx.amount_pi.toFixed(2)} Pi
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-mono text-foreground">
                        {tx.phone_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">TXID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">
                          {formatTxId(tx.txid)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(tx.txid, tx.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">
                        {formatDate(tx.timestamp)}
                      </span>
                    </div>
                  </div>

                  {tx.status === "success" && (
                    <a
                      href={`https://blockexplorer.minepi.com/testnet/tx/${tx.txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Explorer
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Info */}
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
