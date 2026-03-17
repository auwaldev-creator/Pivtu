"use client";

import { Wallet, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  balance: number;
  username: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WalletCard({
  balance,
  username,
  isLoading,
  onRefresh,
}: WalletCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-accent/80 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">
                Welcome back,
              </p>
              <p className="text-lg font-semibold text-white">{username}</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className={cn(
              "rounded-full p-2 transition-all duration-300 hover:bg-white/20 active:scale-95",
              isLoading && "animate-spin"
            )}
            disabled={isLoading}
          >
            <RefreshCw className="h-5 w-5 text-white/80" />
          </button>
        </div>

        {/* Balance */}
        <div className="mt-6">
          <p className="text-sm font-medium text-white/70">Wallet Balance</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">
              {balance.toFixed(2)}
            </span>
            <span className="text-xl font-semibold text-white/80">Pi</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-white">
            +12.5% from last month
          </span>
        </div>
      </div>
    </div>
  );
}
