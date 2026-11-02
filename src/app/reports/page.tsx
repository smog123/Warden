"use client";

import React, { useState } from "react";
import { FileText, Download, Copy, Check, ShieldCheck, Hash, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";

export default function SecurityReportsPage() {
  const [copied, setCopied] = useState(false);

  const sampleReport = {
    id: "REP-2026-11-01-A42",
    targetAccount: "trade-agent-v1.testnet",
    generatedAt: "2026-11-01T17:50:00Z",
    sha256IntegrityHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    overallScore: 68,
    grade: "C",
    findingsCount: {
      critical: 1,
      warning: 1,
      passed: 6,
    },
    criticalFindings: [
      "Agent holds 1 Full-Access key (ed25519:8wZ7bC4p3V...). Violates least-privilege principle; susceptible to total liquidation if model output is compromised.",
    ],
    simulationResult: "5/5 adversarial attacks halted pre-signature by @warden/guard",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warden-surface-border pb-5">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-warden-text-primary">
            Security Reports & Audit Evidence
          </h1>
          <p className="text-xs text-warden-text-secondary mt-1">
            Deterministic compliance certificates, forensic logs & SHA-256 integrity proofs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedBadge />
          <Badge variant="cyan">Evidence v1.0</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-warden-accent" />
            <CardTitle>Audit Certificate #{sampleReport.id}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-warden-status-allow" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Report
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border">
              <span className="text-[10px] text-warden-text-muted uppercase block">
                Target Account
              </span>
              <span className="text-sm font-bold text-warden-text-primary mt-1 block">
                {sampleReport.targetAccount}
              </span>
            </div>

            <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border">
              <span className="text-[10px] text-warden-text-muted uppercase block">
                Trust Grade & Score
              </span>
              <span className="text-sm font-bold text-warden-status-warn mt-1 block">
                Grade {sampleReport.grade} ({sampleReport.overallScore}/100)
              </span>
            </div>

            <div className="p-3.5 rounded bg-warden-surface-base border border-warden-surface-border">
              <span className="text-[10px] text-warden-text-muted uppercase block">
                Lab Defense Verification
              </span>
              <span className="text-sm font-bold text-warden-status-allow mt-1 block">
                100% Intercept Rate
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warden-surface-base border border-warden-surface-border space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-warden-text-muted text-[11px]">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-warden-accent" />
                SHA-256 Integrity Provenance Hash:
              </span>
              <span className="text-warden-text-secondary truncate max-w-sm">
                {sampleReport.sha256IntegrityHash}
              </span>
            </div>
            <div className="flex items-center justify-between text-warden-text-muted text-[11px] pt-1 border-t border-warden-surface-border/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-warden-accent" />
                Evaluated At:
              </span>
              <span className="text-warden-text-secondary">
                {sampleReport.generatedAt}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-warden-text-muted">
              Identified Vulnerabilities & Remediation
            </h4>
            {sampleReport.criticalFindings.map((finding, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded bg-warden-status-blockMuted border border-warden-status-blockBorder text-xs text-warden-text-primary font-mono leading-relaxed"
              >
                {finding}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
