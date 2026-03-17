"use client";

import { Wallet, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WalletCardProps {
  balance: number;
  username: string;
  walletAddress?: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WalletCard({
  balance,
  username,
  walletAddress,
  isLoading,
  onRefresh,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy address");
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

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
              <p className="text-sm font-medium text-white/70">Welcome back,</p>
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
        <div className="mt-5">
          <p className="text-sm font-medium text-white/70">Pi Balance</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">
              {balance.toFixed(4)}
            </span>
            <span className="text-xl font-semibold text-white/80">Pi</span>
          </div>
        </div>

        {/* Wallet Address - Displayed below balance */}
        {walletAddress && (
          <div className="mt-5 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/60">Wallet Address</p>
                <p className="mt-1 font-mono text-sm text-white">
                  {truncateAddress(walletAddress)}
                </p>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-white/30 active:scale-95"
                title="Copy address"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* BlockExplorer Link */}
        {walletAddress && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <ExternalLink className="h-4 w-4 text-white/80" />
            <a
              href={`https://blockexplorer.minepi.com/testnet/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white hover:underline"
            >
              View on Pi BlockExplorer
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
