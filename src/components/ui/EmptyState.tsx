import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center border border-dashed border-warden-surface-border rounded-lg bg-warden-surface-base/50",
        className
      )}
    >
      <div className="p-3 mb-3 rounded-full bg-warden-surface-elevated text-warden-text-muted border border-warden-surface-border">
        <Icon className="w-6 h-6 text-warden-text-muted" />
      </div>
      <h4 className="text-sm font-semibold text-warden-text-primary tracking-wide mb-1">
        {title}
      </h4>
      <p className="text-xs text-warden-text-muted max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
