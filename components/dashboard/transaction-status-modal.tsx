"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle, X, ExternalLink, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/hooks/use-pi-sdk";

interface TransactionStatusModalProps {
  isOpen: boolean;
  status: PaymentStatus;
  planSize?: string;
  amount?: number;
  txid?: string;
  phoneNumber?: string;
  networkProvider?: string;
  onClose: () => void;
}

const statusConfig = {
  idle: {
    icon: null,
    title: "",
    description: "",
    color: "",
  },
  authenticating: {
    icon: Loader2,
    title: "Authenticating",
    description: "Verifying your Pi wallet...",
    color: "text-primary",
    animate: true,
  },
  creating_payment: {
    icon: Loader2,
    title: "Creating Payment",
    description: "Preparing your transaction...",
    color: "text-primary",
    animate: true,
  },
  awaiting_approval: {
    icon: Loader2,
    title: "Awaiting Approval",
    description: "Please confirm the payment in your Pi wallet...",
    color: "text-[#F59E0B]",
    animate: true,
  },
  awaiting_completion: {
    icon: Loader2,
    title: "Processing Payment",
    description: "Transaction is being processed on the blockchain...",
    color: "text-primary",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    title: "Transaction Successful",
    description: "Your data bundle has been delivered!",
    color: "text-success",
    animate: false,
  },
  failed: {
    icon: XCircle,
    title: "Transaction Failed",
    description: "Something went wrong. Please try again.",
    color: "text-destructive",
    animate: false,
  },
  cancelled: {
    icon: XCircle,
    title: "Transaction Cancelled",
    description: "You cancelled the payment.",
    color: "text-muted-foreground",
    animate: false,
  },
};

export function TransactionStatusModal({
  isOpen,
  status,
  planSize,
  amount,
  txid,
  phoneNumber,
  networkProvider,
  onClose,
}: TransactionStatusModalProps) {
  const [copied, setCopied] = useState(false);
  const config = statusConfig[status];

  const copyTxid = async () => {
    if (!txid) return;
    try {
      await navigator.clipboard.writeText(txid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const formatTxId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  // Auto close on success after 3 seconds
  useEffect(() => {
    if (status === "completed" && isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, isOpen, onClose]);

  if (!isOpen || status === "idle") return null;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Close button for completed/failed/cancelled states */}
        {(status === "completed" || status === "failed" || status === "cancelled") && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full",
              status === "completed" && "bg-success/10",
              status === "failed" && "bg-destructive/10",
              status === "cancelled" && "bg-muted/10",
              !["completed", "failed", "cancelled"].includes(status) && "bg-primary/10"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-10 w-10",
                  config.color,
                  config.animate && "animate-spin"
                )}
              />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        {/* Transaction Details (show when processing or completed) */}
        {(planSize || amount) && (
          <div className="mb-6 rounded-xl bg-secondary/50 p-4 space-y-2">
            {planSize && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Data Plan</span>
                <span className="font-medium text-foreground">{planSize}</span>
              </div>
            )}
            {networkProvider && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium text-foreground uppercase">{networkProvider}</span>
              </div>
            )}
            {phoneNumber && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-mono text-foreground">{phoneNumber}</span>
              </div>
            )}
            {amount !== undefined && (
              <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">{amount.toFixed(2)} Pi</span>
              </div>
            )}
          </div>
        )}

        {/* TXID (show when completed) */}
        {status === "completed" && txid && (
          <div className="mb-6 rounded-xl bg-success/10 border border-success/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-success/80">Transaction ID</span>
              <button
                onClick={copyTxid}
                className="flex items-center gap-1 text-xs text-success hover:text-success/80"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="font-mono text-xs text-success break-all">
              {formatTxId(txid)}
            </p>
            <a
              href={`https://blockexplorer.minepi.com/testnet/tx/${txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/20 py-2 text-xs font-medium text-success hover:bg-success/30"
            >
              <ExternalLink className="h-3 w-3" />
              View on BlockExplorer
            </a>
          </div>
        )}

        {/* Progress Steps (show when processing) */}
        {!["completed", "failed", "cancelled", "idle"].includes(status) && (
          <div className="space-y-3">
            {[
              { key: "creating_payment", label: "Creating payment" },
              { key: "awaiting_approval", label: "Wallet approval" },
              { key: "awaiting_completion", label: "Processing transaction" },
            ].map((step, index) => {
              const steps = ["creating_payment", "awaiting_approval", "awaiting_completion"];
              const currentIndex = steps.indexOf(status);
              const stepIndex = index;
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isCompleted && "bg-success text-success-foreground",
                      isCurrent && "bg-primary text-primary-foreground",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      isCompleted && "text-success",
                      isCurrent && "text-foreground font-medium",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Close Button */}
        {(status === "completed" || status === "failed" || status === "cancelled") && (
          <button
            onClick={onClose}
            className={cn(
              "w-full rounded-xl py-3 font-semibold transition-colors mt-4",
              status === "completed" && "bg-success text-success-foreground hover:bg-success/90",
              status === "failed" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              status === "cancelled" && "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {status === "completed" ? "Done" : "Close"}
          </button>
        )}
      </div>
    </div>
  );
}
