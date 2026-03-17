"use client";

import { TestTube, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestModeToggleProps {
  isTestMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TestModeToggle({ isTestMode, onToggle }: TestModeToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            isTestMode ? "bg-[#F59E0B]/20" : "bg-success/20"
          )}
        >
          {isTestMode ? (
            <TestTube className="h-5 w-5 text-[#F59E0B]" />
          ) : (
            <Zap className="h-5 w-5 text-success" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isTestMode ? "Test Mode" : "Live Mode"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isTestMode ? "Using Test Pi & Mock Naira" : "Using Real Pi"}
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => onToggle(!isTestMode)}
        className={cn(
          "relative h-7 w-12 rounded-full transition-colors duration-200",
          isTestMode ? "bg-[#F59E0B]" : "bg-success"
        )}
        role="switch"
        aria-checked={isTestMode}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
            isTestMode ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
