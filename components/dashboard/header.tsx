"use client";

import { Bell, LogOut } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onSignOut?: () => void;
}

export function Header({ onSignOut }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      {/* Logo and brand */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Pivtu
          </h1>
          <p className="text-[10px] font-medium text-primary">on Pi Network</p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative rounded-xl p-2.5 transition-all hover:bg-secondary active:scale-95">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="rounded-xl p-2.5 transition-all hover:bg-destructive/10 active:scale-95"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
    </header>
  );
}
