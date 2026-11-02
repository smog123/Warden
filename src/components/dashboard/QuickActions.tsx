"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, FlaskConical, Sliders, FileText, Zap } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Inspect Live Wallet",
      description: "Query NEAR testnet RPC for key topology and lockout risk",
      href: "/inspector",
      icon: Search,
      variant: "primary" as const,
    },
    {
      title: "Run Attack Simulation",
      description: "Safely test 5 adversarial injection scenarios in the lab",
      href: "/attack-lab",
      icon: FlaskConical,
      variant: "outline" as const,
    },
    {
      title: "Audit Policy Coverage",
      description: "Identify provider blindspots and native bypass gaps",
      href: "/policy-analyzer",
      icon: Sliders,
      variant: "secondary" as const,
    },
    {
      title: "Generate Audit Report",
      description: "Produce deterministic compliance certificates & logs",
      href: "/reports",
      icon: FileText,
      variant: "secondary" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Zap className="w-4 h-4 text-warden-accent" />
          Quick Actions
        </CardTitle>
        <span className="text-xs font-mono text-warden-text-muted">
          Operational Security Tools
        </span>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link key={act.href} href={act.href} className="block group">
                <div className="p-4 rounded-lg bg-warden-surface-base border border-warden-surface-border group-hover:border-warden-accent/40 group-hover:bg-warden-surface-elevated transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-warden-text-primary group-hover:text-warden-accent transition-colors">
                      <Icon className="w-4 h-4 text-warden-accent" />
                      <span className="text-xs font-semibold tracking-wide">
                        {act.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-warden-text-muted leading-relaxed mb-3">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-warden-accent group-hover:underline flex items-center gap-1">
                    Launch tool →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
