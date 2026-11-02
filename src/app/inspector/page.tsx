"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, Key, AlertTriangle, CheckCircle2, Cpu, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SAMPLE_RECENT_AUDITS } from "@/lib/constants";

export default function WalletInspectorPage() {
  const [searchInput, setSearchInput] = useState("trade-agent-v1.testnet");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(SAMPLE_RECENT_AUDITS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInspect = (accountIdToInspect?: string) => {
    const target = accountIdToInspect || searchInput.trim();
    if (!target) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Simulated fetch delay to showcase loading states cleanly
    setTimeout(() => {
      const match = SAMPLE_RECENT_AUDITS.find(
        (a) => a.accountId.toLowerCase() === target.toLowerCase()
      );

      if (match) {
        setSelectedAudit(match);
      } else {
        // Fallback demo audit for any typed account
        setSelectedAudit({
          id: `aud-${Date.now()}`,
          accountId: target,
          balanceNear: "12.4500",
          keysCount: 1,
          keyTypes: { fullAccess: 0, functionCall: 1, hasPostQuantum: false },
          riskLevel: "SECURE",
          criticalFinding: undefined,
          allowanceRisk: false,
          inspectedAt: "Just now",
          provenance: {
            dataSource: "SIMULATED_TEST_FIXTURE",
            network: "testnet",
            isSimulated: true,
          },
        });
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warden-surface-border pb-5">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-warden-text-primary">
            Wallet Permission Intelligence
          </h1>
          <p className="text-xs text-warden-text-secondary mt-1">
            Audit live NEAR access keys, cryptographic signature schemes, gas allowances & lockout hazards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <Badge variant="cyan">RPC v2.0</Badge>
        </div>
      </div>

      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          code="ERR_RPC_TIMEOUT"
          onRetry={() => handleInspect()}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Search Input Box */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInspect();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-warden-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter NEAR account ID (e.g. agent.testnet, bot.near)..."
                className="w-full pl-10 pr-4 py-2.5 rounded bg-warden-surface-base border border-warden-surface-border text-xs font-mono text-warden-text-primary placeholder:text-warden-text-muted focus:outline-none focus:border-warden-accent focus:ring-1 focus:ring-warden-accent"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="sm:w-36 shrink-0"
            >
              Inspect Account
            </Button>
          </form>

          {/* Quick sample pickers */}
          <div className="mt-3 pt-3 border-t border-warden-surface-border/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-warden-text-muted">Testnet Samples:</span>
            {SAMPLE_RECENT_AUDITS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setSearchInput(sample.accountId);
                  handleInspect(sample.accountId);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-warden-surface-elevated text-warden-text-secondary hover:text-warden-text-primary hover:border-warden-accent/30 border border-warden-surface-border transition-colors"
              >
                {sample.accountId}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Inspection View */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      ) : selectedAudit ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-warden-accent" />
                <CardTitle>{selectedAudit.accountId}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {selectedAudit.riskLevel === "CRITICAL" ? (
                  <Badge variant="block">CRITICAL HAZARD</Badge>
                ) : selectedAudit.riskLevel === "WARNING" ? (
                  <Badge variant="warn">WARNING</Badge>
                ) : (
                  <Badge variant="allow">SECURE TOPOLOGY</Badge>
                )}
                <SimulatedBadge />
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border font-mono">
                  <span className="text-[10px] text-warden-text-muted uppercase tracking-wider block">
                    Account Balance
                  </span>
                  <span className="text-xl font-bold text-warden-text-primary mt-1 block">
                    {selectedAudit.balanceNear} Ⓝ
                  </span>
                </div>

                <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border font-mono">
                  <span className="text-[10px] text-warden-text-muted uppercase tracking-wider block">
                    Access Keys
                  </span>
                  <span className="text-xl font-bold text-warden-text-primary mt-1 block">
                    {selectedAudit.keysCount} total
                  </span>
                  <span className="text-[10px] text-warden-text-muted">
                    {selectedAudit.keyTypes.fullAccess} FullAccess · {selectedAudit.keyTypes.functionCall} FunctionCall
                  </span>
                </div>

                <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border font-mono">
                  <span className="text-[10px] text-warden-text-muted uppercase tracking-wider block">
                    Signature Scheme
                  </span>
                  <span className="text-xl font-bold text-warden-accent mt-1 block flex items-center gap-1.5">
                    {selectedAudit.keyTypes.hasPostQuantum ? "ML-DSA-65" : "Ed25519"}
                  </span>
                  <span className="text-[10px] text-warden-text-muted">
                    {selectedAudit.keyTypes.hasPostQuantum ? "Post-Quantum Hash" : "32-byte Ed25519"}
                  </span>
                </div>
              </div>

              {/* Finding Alert Box if any */}
              {selectedAudit.criticalFinding && (
                <div className="p-4 rounded-lg bg-warden-status-blockMuted border border-warden-status-blockBorder text-xs">
                  <div className="flex items-center gap-2 text-warden-status-block font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Structural Risk Finding</span>
                  </div>
                  <p className="text-warden-text-primary font-mono leading-relaxed">
                    {selectedAudit.criticalFinding}
                  </p>
                </div>
              )}

              {/* Structural Analysis Checklist */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-warden-text-muted">
                  Protocol Security Invariants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-warden-surface-base border border-warden-surface-border flex items-center justify-between">
                    <span className="text-warden-text-secondary">Full-Access Key Prohibited on Agent:</span>
                    {selectedAudit.keyTypes.fullAccess > 0 ? (
                      <span className="text-warden-status-block font-bold">FAIL (Found {selectedAudit.keyTypes.fullAccess})</span>
                    ) : (
                      <span className="text-warden-status-allow font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded bg-warden-surface-base border border-warden-surface-border flex items-center justify-between">
                    <span className="text-warden-text-secondary">Key Allowance Lockout Safeguard:</span>
                    {selectedAudit.allowanceRisk ? (
                      <span className="text-warden-status-warn font-bold">RISK (&lt; 0.25 Ⓝ)</span>
                    ) : (
                      <span className="text-warden-status-allow font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SAFE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No Account Selected"
          description="Enter a NEAR testnet account ID above to perform a deep-dive key inspection."
          actionLabel="Inspect Sample Agent"
          onAction={() => handleInspect(SAMPLE_RECENT_AUDITS[0].accountId)}
        />
      )}
    </div>
  );
}
