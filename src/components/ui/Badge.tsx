import React from "react";
import { cn } from "@/lib/utils";
import { SecurityVerdict } from "@/lib/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "allow" | "warn" | "block" | "neutral" | "cyan" | "simulated";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px] tracking-wide",
    md: "px-2.5 py-1 text-xs tracking-wider",
  };

  const variantStyles = {
    allow: "bg-warden-status-allowMuted text-warden-status-allow border border-warden-status-allowBorder font-medium",
    warn: "bg-warden-status-warnMuted text-warden-status-warn border border-warden-status-warnBorder font-medium",
    block: "bg-warden-status-blockMuted text-warden-status-block border border-warden-status-blockBorder font-medium",
    neutral: "bg-warden-surface-elevated text-warden-text-secondary border border-warden-surface-border",
    cyan: "bg-warden-accent-muted text-warden-accent border border-warden-accent-border font-medium",
    simulated: "bg-amber-950/40 text-amber-300 border border-amber-600/50 font-mono font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded uppercase font-mono transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {variant === "allow" && <span className="h-1.5 w-1.5 rounded-full bg-warden-status-allow" />}
      {variant === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-warden-status-warn" />}
      {variant === "block" && <span className="h-1.5 w-1.5 rounded-full bg-warden-status-block" />}
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: SecurityVerdict }) {
  if (verdict === "ALLOW") return <Badge variant="allow">ALLOW</Badge>;
  if (verdict === "WARN") return <Badge variant="warn">WARN</Badge>;
  return <Badge variant="block">BLOCK</Badge>;
}

export function SimulatedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-950/40 text-amber-400 border border-amber-600/40",
        className
      )}
      title="This dataset or test is safely simulated on NEAR testnet / local harness"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Simulated
    </span>
  );
}
