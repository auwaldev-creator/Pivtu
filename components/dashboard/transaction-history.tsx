"use client";

import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/app/page";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
}

// Pi Testnet BlockExplorer URL
const getExplorerUrl = (txid: string) =>
  `https://blockexplorer.minepi.com/testnet/tx/${txid}`;

export function TransactionHistory({ transactions, onBack }: TransactionHistoryProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const formatTxId = (txid: string) => {
    if (txid.length <= 16) return txid;
    return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[#F59E0B]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-[#F59E0B]";
      case "failed":
        return "text-destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Transaction History
            </h1>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-xl bg-card p-4 border border-border/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {transaction.data_plan_size}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {transaction.network_provider}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(transaction.status)}
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        getStatusColor(transaction.status)
                      )}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-semibold text-primary">
                      {transaction.amount.toFixed(2)} Pi
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-mono text-foreground">
                      {transaction.phone_number}
                    </p>
                  </div>
                </div>

                {/* TXID */}
                <div className="border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Transaction ID (TXID)
                      </p>
                      <p className="font-mono text-xs text-foreground">
                        {formatTxId(transaction.txid)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(transaction.txid, transaction.id)
                        }
                        className="flex h-8 items-center gap-1 rounded-lg bg-secondary px-3 text-xs text-foreground hover:bg-secondary/80"
                      >
                        <Copy className="h-3 w-3" />
                        {copied === transaction.id ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={getExplorerUrl(transaction.txid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Explorer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 rounded-xl bg-secondary/30 p-4">
          <p className="text-xs text-muted-foreground text-center">
            Click "Explorer" to view your transaction on the Pi BlockExplorer
          </p>
        </div>
      </main>
    </div>
  );
}
