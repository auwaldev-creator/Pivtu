"use client";

import { useState } from "react";
import { Phone, X, ContactRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");
    // Limit to 11 digits (Nigerian phone format)
    return digits.slice(0, 11);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const clearInput = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Phone Number
      </label>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 transition-all duration-300",
          isFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border",
          error && "border-destructive"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            isFocused ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          <Phone className="h-5 w-5" />
        </div>

        <div className="flex flex-1 flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Enter phone number
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="08012345678"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {value && (
            <button
              onClick={clearInput}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            title="Select from contacts"
          >
            <ContactRound className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <span className="h-1 w-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Character count */}
      <div className="flex justify-end">
        <span className={cn(
          "text-xs transition-colors",
          value.length === 11 ? "text-success" : "text-muted-foreground"
        )}>
          {value.length}/11
        </span>
      </div>
    </div>
  );
}
