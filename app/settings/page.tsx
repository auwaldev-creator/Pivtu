"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  History,
  Shield,
  Copy,
  ExternalLink,
  RefreshCw,
  TestTube,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// Mock transaction history (in production, fetch from backend)
const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    type: "data_purchase",
    network: "MTN",
    phone_number: "08012345678",
    data_plan: "1GB",
    amount_pi: 0.9,
    status: "success",
    txid: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    delivery_id: "VTU_1710000001_ABC123",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "tx_002",
    type: "data_purchase",
    network: "Airtel",
    phone_number: "09098765432",
    data_plan: "2GB",
    amount_pi: 1.7,
    status: "success",
    txid: "xyz789ghi012xyz789ghi012xyz789ghi012xyz789ghi012xyz789ghi012xyz7",
    delivery_id: "VTU_1710000002_XYZ789",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "tx_003",
    type: "data_purchase",
    network: "Glo",
    phone_number: "07011112222",
    data_plan: "500MB",
    amount_pi: 0.5,
    status: "pending",
    txid: "pending_tx_123",
    delivery_id: "",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Mock user data
const mockUser = {
  uid: "user_pi_abc123def456ghi789jkl012mno345pqr678stu901vwx234",
  username: "PiPioneer2024",
  roles: ["verified", "kyc_passed"],
};

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testModeNairaBalance, setTestModeNairaBalance] = useState("10000.00");

  useEffect(() => {
    // Simulate loading transactions
    setTimeout(() => {
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);

    // Fetch mock naira balance
    fetch("/api/vtu/deliver")
      .then((res) => res.json())
      .then((data) => {
        if (data.test_naira_balance) {
          setTestModeNairaBalance(data.test_naira_balance);
        }
      })
      .catch(() => {});
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>
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
                @{mockUser.username}
              </span>
            </div>

            {/* Pi UID */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pi UID</span>
                <button
                  onClick={() => copyToClipboard(mockUser.uid, "uid")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Copy className="h-3 w-3" />
                  {copied === "uid" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="font-mono text-xs text-foreground break-all bg-secondary/50 rounded-lg p-2">
                {mockUser.uid}
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

            {/* Network */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network</span>
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  Testnet (Sandbox)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Test Mode Balance */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-[#F59E0B]" />
            <h2 className="text-base font-semibold text-foreground">
              Test Mode Balance
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 border border-[#F59E0B]/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#F59E0B]/80 mb-1">Mock Naira Balance</p>
                <p className="text-2xl font-bold text-[#F59E0B]">
                  NGN {testModeNairaBalance}
                </p>
              </div>
              <button
                onClick={() => {
                  fetch("/api/vtu/deliver")
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.test_naira_balance) {
                        setTestModeNairaBalance(data.test_naira_balance);
                      }
                    });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/20 transition-colors hover:bg-[#F59E0B]/30"
              >
                <RefreshCw className="h-5 w-5 text-[#F59E0B]" />
              </button>
            </div>
            <p className="mt-3 text-xs text-[#F59E0B]/70">
              This is a simulated balance for testing. All transactions use Test
              Pi and Mock Naira.
            </p>
          </div>
        </section>

        {/* Transaction History */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Transaction History
            </h2>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Testnet
            </span>
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
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
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

                    {tx.delivery_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Delivery ID
                        </span>
                        <span className="font-mono text-foreground">
                          {tx.delivery_id}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">
                        {formatDate(tx.timestamp)}
                      </span>
                    </div>
                  </div>

                  {tx.status === "success" && (
                    <a
                      href={`https://piblockexplorer.com/tx/${tx.txid}`}
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
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Testnet Environment - For Development Only
          </p>
        </footer>
      </main>
    </div>
  );
}
