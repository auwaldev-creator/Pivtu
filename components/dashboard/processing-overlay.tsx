"use client";

import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import type { PaymentStatus } from "@/hooks/use-pi-sdk";
import { cn } from "@/lib/utils";

interface ProcessingOverlayProps {
  status: PaymentStatus;
  planSize?: string;
  amount?: number;
}

const statusMessages: Record<PaymentStatus, { title: string; subtitle: string }> = {
  idle: { title: "", subtitle: "" },
  authenticating: { 
    title: "Authenticating", 
    subtitle: "Connecting to Pi Network..." 
  },
  creating_payment: { 
    title: "Creating Payment", 
    subtitle: "Initializing transaction..." 
  },
  awaiting_approval: { 
    title: "Awaiting Approval", 
    subtitle: "Server is verifying your payment..." 
  },
  awaiting_completion: { 
    title: "Processing Payment", 
    subtitle: "Confirming blockchain transaction..." 
  },
  completed: { 
    title: "Payment Complete", 
    subtitle: "Transaction successful!" 
  },
  failed: { 
    title: "Payment Failed", 
    subtitle: "Please try again" 
  },
  cancelled: { 
    title: "Payment Cancelled", 
    subtitle: "Transaction was cancelled" 
  },
};

const steps = [
  { status: "creating_payment", label: "Creating Payment" },
  { status: "awaiting_approval", label: "Server Approval" },
  { status: "awaiting_completion", label: "Blockchain Confirmation" },
];

export function ProcessingOverlay({ status, planSize, amount }: ProcessingOverlayProps) {
  const message = statusMessages[status];
  const currentStepIndex = steps.findIndex((s) => s.status === status);

  if (status === "idle" || status === "completed" || status === "failed" || status === "cancelled") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center px-8 text-center">
        {/* Animated Loader */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDuration: "1.5s" }} />
          
          {/* Inner content */}
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-card">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>

        {/* Status Message */}
        <h2 className="mb-2 text-2xl font-bold text-foreground">{message.title}</h2>
        <p className="mb-6 text-muted-foreground">{message.subtitle}</p>

        {/* Transaction Details */}
        {planSize && amount && (
          <div className="mb-8 rounded-xl bg-card/50 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Purchasing <span className="font-semibold text-foreground">{planSize}</span> for{" "}
              <span className="font-semibold text-primary">{amount.toFixed(2)} Pi</span>
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="w-full max-w-xs">
          {steps.map((step, index) => {
            const isActive = step.status === status;
            const isCompleted = currentStepIndex > index;

            return (
              <div key={step.status} className="flex items-center gap-3 mb-3 last:mb-0">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-success" />
          <span>Secured by Pi Network</span>
        </div>
      </div>
    </div>
  );
}
