import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "highlight";
  glow?: boolean;
}

export function Card({
  className,
  variant = "default",
  glow = false,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-warden-surface-card border border-warden-surface-border text-warden-text-primary",
    elevated: "bg-warden-surface-elevated border border-warden-surface-border shadow-lg text-warden-text-primary",
    outline: "bg-transparent border border-warden-surface-border text-warden-text-primary",
    highlight: "bg-warden-surface-card border border-warden-accent/30 text-warden-text-primary",
  };

  return (
    <div
      className={cn(
        "rounded-lg transition-all duration-200",
        variantStyles[variant],
        glow && "ring-1 ring-warden-accent/20 shadow-[0_0_15px_rgba(0,216,246,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-b border-warden-surface-border/60 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold tracking-wider text-warden-text-primary uppercase flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
