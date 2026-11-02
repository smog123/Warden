import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { KeyDistribution } from "@/lib/types";
import { Key, AlertOctagon, Cpu, ShieldCheck } from "lucide-react";

interface PermissionDistributionProps {
  distribution: KeyDistribution;
}

export function PermissionDistribution({ distribution }: PermissionDistributionProps) {
  const total = distribution.fullAccess + distribution.functionCall;
  const functionCallPct = total > 0 ? Math.round((distribution.functionCall / total) * 100) : 0;
  const fullAccessPct = total > 0 ? Math.round((distribution.fullAccess / total) * 100) : 0;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          <Key className="w-4 h-4 text-warden-accent" />
          Permission Distribution
        </CardTitle>
        <span className="text-xs font-mono text-warden-text-muted">
          {total} Total Keys
        </span>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-warden-status-allow flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warden-status-allow" />
              Scoped Function-Call ({functionCallPct}%)
            </span>
            <span className="text-warden-status-block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warden-status-block" />
              Full-Access ({fullAccessPct}%)
            </span>
          </div>

          {/* Visual distribution bar */}
          <div className="h-3 w-full rounded-full bg-warden-surface-base border border-warden-surface-border overflow-hidden flex">
            <div
              style={{ width: `${functionCallPct}%` }}
              className="bg-warden-status-allow transition-all duration-300"
              title={`Function-Call Keys: ${distribution.functionCall}`}
            />
            <div
              style={{ width: `${fullAccessPct}%` }}
              className="bg-warden-status-block transition-all duration-300"
              title={`Full-Access Keys: ${distribution.fullAccess}`}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-warden-status-allow" />
              <span className="text-warden-text-secondary">Function-Call Keys (Scoped)</span>
            </div>
            <span className="font-mono font-bold text-warden-text-primary">
              {distribution.functionCall}
            </span>
          </div>

          <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-warden-status-block" />
              <span className="text-warden-text-secondary">Full-Access Keys (Dangerous for AI)</span>
            </div>
            <span className="font-mono font-bold text-warden-status-block">
              {distribution.fullAccess}
            </span>
          </div>

          <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-warden-accent" />
              <span className="text-warden-text-secondary">Post-Quantum Keys (ML-DSA-65)</span>
            </div>
            <span className="font-mono font-bold text-warden-accent">
              {distribution.postQuantumHash}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-warden-text-muted leading-relaxed">
          Best practice: AI agent runtimes must never hold Full-Access keys. Any non-zero native transfer or key management should be routed via scoped Function-Call proxies.
        </p>
      </CardContent>
    </Card>
  );
}
