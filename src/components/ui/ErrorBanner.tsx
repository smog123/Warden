import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ErrorBannerProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  title = "Security Evaluation Error",
  message,
  code,
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-warden-status-blockMuted border border-warden-status-blockBorder text-warden-text-primary flex items-start justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warden-status-block shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-warden-text-primary">
              {title}
            </h5>
            {code && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                {code}
              </span>
            )}
          </div>
          <p className="text-xs text-warden-text-secondary mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <Button size="sm" variant="danger" onClick={onRetry} className="text-xs py-1 px-2.5">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-warden-text-muted hover:text-warden-text-primary transition-colors p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
