"use client";

import { Wallet, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectWalletProps {
  isSDKLoaded: boolean;
  isConnecting: boolean;
  onConnect: () => void;
}

export function ConnectWallet({ isSDKLoaded, isConnecting, onConnect }: ConnectWalletProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <svg viewBox="0 0 32 32" className="h-14 w-14 text-primary-foreground" fill="currentColor">
            <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 2c7.732 0 14 6.268 14 14s-6.268 14-14 14S2 23.732 2 16 8.268 2 16 2zm-4 7v2H8v2h4v10h2V13h4v-2h-4V9h-2v2h-2V9h-2zm10 4v8h-2v-8h2z" />
          </svg>
        </div>
      </div>

      {/* App Name */}
      <h1 className="mb-2 text-3xl font-bold text-foreground">Pivtu</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Buy data bundles instantly with Pi
      </p>

      {/* Features */}
      <div className="mb-10 space-y-4 w-full max-w-xs">
        {[
          { icon: Wallet, text: "Instant data recharge" },
          { icon: Shield, text: "Secured by Pi Network" },
          { icon: CheckCircle2, text: "No registration needed" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 rounded-xl bg-card/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{text}</span>
          </div>
        ))}
      </div>

      {/* Connect Button */}
      <button
        onClick={onConnect}
        disabled={!isSDKLoaded || isConnecting}
        className={cn(
          "group relative w-full max-w-xs overflow-hidden rounded-2xl py-5 font-semibold transition-all duration-300",
          "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]",
          "text-primary-foreground shadow-xl shadow-primary/30",
          "hover:bg-[position:100%_0] hover:shadow-2xl hover:shadow-primary/40",
          "active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        )}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        
        <div className="relative flex items-center justify-center gap-3">
          {!isSDKLoaded ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading Pi SDK...</span>
            </>
          ) : isConnecting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-6 w-6" />
              <span className="text-lg">Connect Pi Wallet</span>
            </>
          )}
        </div>
      </button>

      {/* SDK Status */}
      <div className="mt-6 flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            isSDKLoaded ? "bg-success" : "bg-muted-foreground animate-pulse"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {isSDKLoaded ? "Pi SDK Ready" : "Initializing Pi SDK..."}
        </span>
      </div>

      {/* KYC Notice */}
      <div className="mt-8 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3">
        <Shield className="h-4 w-4 shrink-0 text-success" />
        <p className="text-xs text-success">
          Verified by Pi Network KYC. No additional registration required.
        </p>
      </div>
    </div>
  );
}
