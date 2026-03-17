"use client";

import { cn } from "@/lib/utils";
import { Zap, Wifi, Signal, Rocket } from "lucide-react";

export interface DataPlan {
  id: string;
  size: string;
  price: number;
  validity: string;
  popular?: boolean;
}

interface DataPlanSelectorProps {
  plans: DataPlan[];
  selected: DataPlan | null;
  onSelect: (plan: DataPlan) => void;
}

const icons = [Zap, Wifi, Signal, Rocket];

export function DataPlanSelector({
  plans,
  selected,
  onSelect,
}: DataPlanSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Select Data Plan
      </label>
      <div className="grid grid-cols-2 gap-3">
        {plans.map((plan, index) => {
          const Icon = icons[index % icons.length];
          const isSelected = selected?.id === plan.id;

          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={cn(
                "group relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all duration-300",
                "hover:shadow-lg active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Popular
                </div>
              )}

              <div className="flex w-full items-start justify-between">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Selection indicator */}
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-lg font-bold text-foreground">{plan.size}</p>
                <p className="text-xs text-muted-foreground">{plan.validity}</p>
              </div>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary">
                  {plan.price.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Pi
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
