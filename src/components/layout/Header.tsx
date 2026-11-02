"use client";

import React from "react";
import { ShieldCheck, Activity, Terminal, ExternalLink } from "lucide-react";
import { SimulatedBadge } from "@/components/ui/Badge";
import { APP_CONFIG } from "@/lib/constants";

export function Header() {
  return (
    <header className="h-16 border-b border-warden-surface-border bg-warden-surface-base/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-warden-text-muted">
            NETWORK:
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-warden-surface-card border border-warden-surface-border text-xs font-mono text-warden-text-primary">
            <span className="w-2 h-2 rounded-full bg-warden-status-allow animate-pulse" />
            {APP_CONFIG.network}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-warden-text-muted border-l border-warden-surface-border pl-4">
          <span>RPC:</span>
          <span className="text-warden-text-secondary">fastnear-testnet</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-warden-text-muted border-l border-warden-surface-border pl-4">
          <span>MODE:</span>
          <span className="text-warden-accent font-semibold">STRICT PRE-SIGN</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Hackathon Track Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-warden-accent-muted border border-warden-accent-border text-warden-accent text-xs font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>Track 06: AI Security</span>
        </div>

        {/* Global Demo Status */}
        <SimulatedBadge />

        {/* Status link to official docs */}
        <a
          href="https://github.com/smog123/Warden"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded text-warden-text-muted hover:text-warden-text-primary hover:bg-warden-surface-elevated transition-colors border border-transparent hover:border-warden-surface-border"
          title="View GitHub Repository"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
