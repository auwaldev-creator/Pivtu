"use client";

import { cn } from "@/lib/utils";

export type NetworkProvider = "mtn" | "airtel" | "glo" | "9mobile";

interface NetworkSelectorProps {
  selected: NetworkProvider | null;
  onSelect: (network: NetworkProvider) => void;
}

const networks: { id: NetworkProvider; name: string; color: string; bgColor: string }[] = [
  { id: "mtn", name: "MTN", color: "#FFCC00", bgColor: "bg-[#FFCC00]" },
  { id: "airtel", name: "Airtel", color: "#FF0000", bgColor: "bg-[#FF0000]" },
  { id: "glo", name: "Glo", color: "#00A551", bgColor: "bg-[#00A551]" },
  { id: "9mobile", name: "9mobile", color: "#006B53", bgColor: "bg-[#006B53]" },
];

export function NetworkSelector({ selected, onSelect }: NetworkSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Select Network
      </label>
      <div className="grid grid-cols-4 gap-3">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => onSelect(network.id)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-300",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              selected === network.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {/* Network logo circle */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-transform duration-300",
                network.bgColor,
                selected === network.id ? "scale-110" : "group-hover:scale-105"
              )}
              style={{ color: network.id === "mtn" ? "#000" : "#fff" }}
            >
              {network.name.slice(0, 2).toUpperCase()}
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                selected === network.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {network.name}
            </span>
            
            {/* Selection indicator */}
            {selected === network.id && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
