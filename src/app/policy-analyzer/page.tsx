"use client";

import React, { useState } from "react";
import { Sliders, AlertTriangle, ShieldCheck, Check, X, Info, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function PolicyAnalyzerPage() {
  const [selectedPolicyType, setSelectedPolicyType] = useState<"standard" | "permissive" | "hardened">("standard");

  const matrixRows = [
    {
      capability: "Native NEAR Transfer Limits",
      protocol: { supported: false, note: "Full-Access keys have no ceiling; Function-Call keys forbid deposit > 0" },
      provider: { supported: "conditional", note: "Supported for intents; BYPASSED if native.near.transfer: true" },
      warden: { supported: true, note: "Strict per-transaction and daily ceilings evaluated pre-signature" },
      risk: "CRITICAL",
    },
    {
      capability: "Recipient Whitelist Filtering",
      protocol: { supported: false, note: "Full-Access keys send to any valid account ID" },
      provider: { supported: "conditional", note: "Applies only to intent swaps; ignored for native transfers" },
      warden: { supported: true, note: "Enforces strict whitelist before granting signature permission" },
      risk: "HIGH",
    },
    {
      capability: "Contract Method Scoping",
      protocol: { supported: true, note: "Function-Call keys restrict to exact method_names array" },
      provider: { supported: false, note: "Provider policies manage high-level actions (swap, transfer)" },
      warden: { supported: true, note: "Validates method against whitelist; strictly rejects wildcard access" },
      risk: "MEDIUM",
    },
    {
      capability: "Sliding-Window Rate Limiting",
      protocol: { supported: false, note: "Allows transactions as fast as nonces and gas allow" },
      provider: { supported: true, note: "Enforces max_actions_per_hour on intent requests" },
      warden: { supported: true, note: "Maintains local 60-minute sliding window to halt Salami attacks" },
      risk: "MEDIUM",
    },
    {
      capability: "Counterparty Reputation & Mutation Check",
      protocol: { supported: false, note: "Protocol does not evaluate reputation or contract code changes" },
      provider: { supported: false, note: "No multi-signal reputation or code mutability checks" },
      warden: { supported: true, note: "Queries view_code and blocklist registry; halts newly altered contracts" },
      risk: "CRITICAL",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warden-surface-border pb-5">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-warden-text-primary">
            Policy Coverage Analyzer
          </h1>
          <p className="text-xs text-warden-text-secondary mt-1">
            Tri-layer comparative analysis: NEAR Protocol vs Agent Provider vs WARDEN Guard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <Badge variant="cyan">Matrix v1.0</Badge>
        </div>
      </div>

      {/* Critical Gap Callout */}
      <div className="p-4 rounded-lg bg-warden-surface-card border-l-4 border-l-warden-status-warn border border-warden-surface-border text-xs space-y-2">
        <div className="flex items-center gap-2 text-warden-status-warn font-semibold font-mono">
          <AlertTriangle className="w-4 h-4" />
          <span>DOCUMENTED ARCHITECTURAL BLINDSPOT: Native Transfer Bypass</span>
        </div>
        <p className="text-warden-text-secondary leading-relaxed font-sans">
          In the official NEAR Agent API documentation (<code className="text-warden-accent font-mono text-[11px]">policies-and-limits</code>), enabling <code className="text-warden-accent font-mono text-[11px]">native.near.transfer</code> completely circumvents destination whitelists, USD budgets, timelocks, and schedules. WARDEN independently enforces client-side pre-flight guards to close this gap.
        </p>
      </div>

      {/* Coverage Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sliders className="w-4 h-4 text-warden-accent" />
            Enforcement Tier Comparison
          </CardTitle>
          <span className="text-xs font-mono text-warden-text-muted">
            5 Critical Invariants
          </span>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-warden-surface-border text-warden-text-muted font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Security Dimension</th>
                  <th className="pb-3 font-semibold">Tier 1: NEAR Protocol</th>
                  <th className="pb-3 font-semibold">Tier 2: Agent Provider</th>
                  <th className="pb-3 font-semibold">Tier 3: WARDEN Guard</th>
                  <th className="pb-3 font-semibold text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warden-surface-border/50 font-mono">
                {matrixRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-warden-surface-elevated/40 transition-colors">
                    <td className="py-3.5 font-medium text-warden-text-primary">
                      {row.capability}
                    </td>

                    {/* Protocol */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-start gap-1.5">
                        {row.protocol.supported ? (
                          <Check className="w-3.5 h-3.5 text-warden-status-allow shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-warden-status-block shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] font-sans text-warden-text-secondary leading-snug">
                          {row.protocol.note}
                        </span>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-start gap-1.5">
                        {row.provider.supported === true ? (
                          <Check className="w-3.5 h-3.5 text-warden-status-allow shrink-0 mt-0.5" />
                        ) : row.provider.supported === "conditional" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-warden-status-warn shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-warden-status-block shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] font-sans text-warden-text-secondary leading-snug">
                          {row.provider.note}
                        </span>
                      </div>
                    </td>

                    {/* WARDEN */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-warden-status-allow shrink-0 mt-0.5" />
                        <span className="text-[11px] font-sans text-warden-status-allow leading-snug">
                          {row.warden.note}
                        </span>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 text-right whitespace-nowrap">
                      {row.risk === "CRITICAL" ? (
                        <Badge variant="block">CRITICAL</Badge>
                      ) : row.risk === "HIGH" ? (
                        <Badge variant="warn">HIGH GAP</Badge>
                      ) : (
                        <Badge variant="neutral">MODERATE</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
