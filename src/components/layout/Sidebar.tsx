"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Search,
  Sliders,
  FlaskConical,
  FileText,
  Settings2,
  Shield,
  Menu,
  X,
  Radio,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/", icon: ShieldAlert, badge: undefined },
    { name: "Wallet Inspector", href: "/inspector", icon: Search, badge: "RPC" },
    { name: "Policy Analyzer", href: "/policy-analyzer", icon: Sliders, badge: undefined },
    { name: "Attack Laboratory", href: "/attack-lab", icon: FlaskConical, badge: "5 Labs" },
    { name: "Security Reports", href: "/reports", icon: FileText, badge: undefined },
    { name: "Settings", href: "/settings", icon: Settings2, badge: undefined },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 rounded-full bg-warden-surface-elevated text-warden-accent border border-warden-accent-border shadow-xl focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-64 bg-warden-surface-base border-r border-warden-surface-border flex flex-col justify-between transition-transform duration-200 z-40",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-warden-surface-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-warden-accent-muted border border-warden-accent-border flex items-center justify-center text-warden-accent group-hover:border-warden-accent transition-colors">
                <Shield className="w-4 h-4 fill-warden-accent/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold font-mono tracking-widest text-warden-text-primary group-hover:text-warden-accent transition-colors">
                  {APP_CONFIG.name}
                </span>
                <span className="text-[10px] tracking-wider text-warden-text-muted font-mono uppercase">
                  AI Defense Layer
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-warden-text-muted">
              Security Navigation
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium tracking-wide transition-all group",
                    isActive
                      ? "bg-warden-surface-elevated text-warden-text-primary border-l-2 border-warden-accent shadow-sm"
                      : "text-warden-text-secondary hover:text-warden-text-primary hover:bg-warden-surface-card"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-warden-accent"
                          : "text-warden-text-muted group-hover:text-warden-text-secondary"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase",
                        isActive
                          ? "bg-warden-accent-muted text-warden-accent border-warden-accent-border"
                          : "bg-warden-surface-card text-warden-text-muted border-warden-surface-border"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-4 border-t border-warden-surface-border">
          <div className="p-3 rounded bg-warden-surface-card border border-warden-surface-border text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-warden-text-muted uppercase tracking-wider">
                Guard Engine
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-warden-status-allow">
                <Radio className="w-3 h-3 animate-pulse" />
                ARMED
              </span>
            </div>
            <p className="text-[11px] text-warden-text-secondary leading-snug">
              Deterministic pre-flight interceptor active.
            </p>
            <div className="mt-2 pt-2 border-t border-warden-surface-border/50 flex items-center justify-between text-[10px] font-mono text-warden-text-muted">
              <span>{APP_CONFIG.version}</span>
              <span className="flex items-center gap-1 text-warden-text-muted">
                <Lock className="w-2.5 h-2.5" />
                Zero-Custody
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
