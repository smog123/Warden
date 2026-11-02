import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "secondary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantStyles = {
    primary:
      "bg-warden-accent text-warden-bg font-semibold hover:bg-warden-accent-hover active:bg-cyan-400 border border-transparent shadow-[0_0_12px_rgba(0,216,246,0.25)]",
    secondary:
      "bg-warden-surface-elevated text-warden-text-primary hover:bg-warden-surface-hover active:bg-slate-800 border border-warden-surface-border",
    danger:
      "bg-warden-status-blockMuted text-warden-status-block hover:bg-red-950/60 active:bg-red-900 border border-warden-status-blockBorder font-medium",
    ghost:
      "bg-transparent text-warden-text-secondary hover:text-warden-text-primary hover:bg-warden-surface-card border border-transparent",
    outline:
      "bg-transparent text-warden-accent hover:bg-warden-accent-muted active:bg-cyan-950/40 border border-warden-accent/40 font-medium",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-sans tracking-wide transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-warden-accent disabled:opacity-50 disabled:pointer-events-none select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
