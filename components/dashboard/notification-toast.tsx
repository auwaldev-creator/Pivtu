"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationToastProps {
  type: NotificationType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    bg: "bg-success/10",
    border: "border-success/30",
    icon: "text-success",
    title: "text-success",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: "text-destructive",
    title: "text-destructive",
  },
  warning: {
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    icon: "text-[#F59E0B]",
    title: "text-[#F59E0B]",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
    title: "text-primary",
  },
};

export function NotificationToast({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  const Icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <div
      className={cn(
        "fixed left-4 right-4 top-4 z-50 mx-auto max-w-md transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-sm",
          style.bg,
          style.border
        )}
      >
        <div className={cn("shrink-0 mt-0.5", style.icon)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold", style.title)}>{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
