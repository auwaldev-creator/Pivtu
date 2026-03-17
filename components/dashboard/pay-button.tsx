"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PayButtonProps {
  amount: number;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function PayButton({ amount, disabled, loading, onClick }: PayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl py-5 font-semibold transition-all duration-300",
        "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]",
        "text-primary-foreground shadow-xl shadow-primary/30",
        "hover:bg-[position:100%_0] hover:shadow-2xl hover:shadow-primary/40",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-[position:0%_0]"
      )}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

      <div className="relative flex items-center justify-center gap-3">
        {loading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Processing...</span>
          </>
        ) : (
          <>
            {/* Pi Logo */}
            <svg
              viewBox="0 0 32 32"
              className="h-7 w-7"
              fill="currentColor"
            >
              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 2c7.732 0 14 6.268 14 14s-6.268 14-14 14S2 23.732 2 16 8.268 2 16 2zm-4 7v2H8v2h4v10h2V13h4v-2h-4V9h-2v2h-2V9h-2zm10 4v8h-2v-8h2z" />
            </svg>
            <span className="text-lg">Pay {amount.toFixed(2)} Pi</span>
          </>
        )}
      </div>
    </button>
  );
}
