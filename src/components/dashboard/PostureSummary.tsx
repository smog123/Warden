import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";
import { SecurityPosture } from "@/lib/types";
import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";

interface PostureSummaryProps {
  posture: SecurityPosture;
}

export function PostureSummary({ posture }: PostureSummaryProps) {
  const getStatusBadge = (status: SecurityPosture["status"]) => {
    switch (status) {
      case "OPTIMAL":
        return <Badge variant="allow">OPTIMAL</Badge>;
      case "ATTENTION_REQUIRED":
        return <Badge variant="warn">ATTENTION REQUIRED</Badge>;
      case "COMPROMISED":
        return <Badge variant="block">COMPROMISED</Badge>;
    }
  };

  const getGradeColor = (grade: SecurityPosture["grade"]) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-warden-status-allow border-warden-status-allowBorder bg-warden-status-allowMuted";
      case "B":
      case "C":
        return "text-warden-status-warn border-warden-status-warnBorder bg-warden-status-warnMuted";
      case "F":
        return "text-warden-status-block border-warden-status-blockBorder bg-warden-status-blockMuted";
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          <ShieldCheck className="w-4 h-4 text-warden-accent" />
          Security Posture Summary
        </CardTitle>
        <div className="flex items-center gap-2">
          {getStatusBadge(posture.status)}
          <SimulatedBadge />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-warden-surface-base border border-warden-surface-border">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-warden-text-muted">
              Composite Trust Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold font-mono tracking-tight text-warden-text-primary">
                {posture.score}
              </span>
              <span className="text-xs font-mono text-warden-text-muted">/ 100</span>
            </div>
            <p className="text-xs text-warden-text-secondary mt-1">
              Evaluated across 42 policy coverage tests & key risk rules
            </p>
          </div>

          <div
            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold font-mono shadow-inner ${getGradeColor(
              posture.grade
            )}`}
          >
            {posture.grade}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border">
            <span className="text-warden-text-muted block text-[11px] uppercase tracking-wider">
              Active Guards
            </span>
            <span className="text-lg font-mono font-bold text-warden-text-primary mt-0.5 block">
              {posture.activeGuardsCount} / {posture.totalPoliciesActive}
            </span>
            <span className="text-[10px] text-warden-text-muted">Pre-signing wrappers</span>
          </div>

          <div className="p-3 rounded bg-warden-surface-base border border-warden-surface-border">
            <span className="text-warden-text-muted block text-[11px] uppercase tracking-wider">
              Full-Access Violations
            </span>
            <span className="text-lg font-mono font-bold text-warden-status-block mt-0.5 block">
              {posture.fullAccessViolationsCount}
            </span>
            <span className="text-[10px] text-warden-status-warn">Must be revoked</span>
          </div>
        </div>

        <div className="text-[11px] text-warden-text-muted font-mono flex items-center justify-between border-t border-warden-surface-border/50 pt-3">
          <span>Evaluation Engine: WARDEN Core v0.1</span>
          <span>Fail-Closed: Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
