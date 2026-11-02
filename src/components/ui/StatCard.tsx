import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    text: string;
    type: "positive" | "negative" | "neutral" | "danger" | "warning";
  };
  icon: LucideIcon;
  variant?: "default" | "critical" | "warning" | "success" | "accent";
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const iconVariants = {
    default: "text-warden-text-secondary bg-warden-surface-elevated border-warden-surface-border",
    critical: "text-warden-status-block bg-warden-status-blockMuted border-warden-status-blockBorder",
    warning: "text-warden-status-warn bg-warden-status-warnMuted border-warden-status-warnBorder",
    success: "text-warden-status-allow bg-warden-status-allowMuted border-warden-status-allowBorder",
    accent: "text-warden-accent bg-warden-accent-muted border-warden-accent-border",
  };

  const trendColors = {
    positive: "text-warden-status-allow",
    negative: "text-warden-status-block",
    danger: "text-warden-status-block font-semibold",
    warning: "text-warden-status-warn",
    neutral: "text-warden-text-muted",
  };

  return (
    <div className="bg-warden-surface-card border border-warden-surface-border rounded-lg p-5 flex flex-col justify-between hover:border-warden-surface-border/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-warden-text-muted">
          {label}
        </span>
        <div className={cn("p-2 rounded border", iconVariants[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-warden-text-primary">
            {value}
          </span>
          {subValue && (
            <span className="text-xs font-mono text-warden-text-muted">
              {subValue}
            </span>
          )}
        </div>

        {trend && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className={cn("font-mono", trendColors[trend.type])}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
