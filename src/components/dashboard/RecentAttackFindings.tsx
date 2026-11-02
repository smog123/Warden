import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { VerdictBadge, SimulatedBadge } from "@/components/ui/Badge";
import { AttackLabFinding } from "@/lib/types";
import { FlaskConical, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface RecentAttackFindingsProps {
  findings: AttackLabFinding[];
}

export function RecentAttackFindings({ findings }: RecentAttackFindingsProps) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          <FlaskConical className="w-4 h-4 text-warden-accent" />
          Recent Attack Laboratory Findings
        </CardTitle>
        <Link
          href="/attack-lab"
          className="text-xs font-mono text-warden-accent hover:underline flex items-center gap-1"
        >
          View Attack Lab <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {findings.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-lg bg-warden-surface-base border border-warden-surface-border hover:border-warden-surface-border/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-warden-status-block shrink-0" />
                <span className="text-xs font-semibold text-warden-text-primary tracking-wide">
                  {item.scenarioName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <VerdictBadge verdict={item.verdict} />
                <SimulatedBadge />
              </div>
            </div>

            <div className="text-xs text-warden-text-secondary font-mono space-y-1 mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-warden-text-muted">Target Recipient:</span>
                <span className="text-warden-text-primary">{item.targetAccount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-warden-text-muted">Action Attempt:</span>
                <span className="text-warden-text-secondary truncate max-w-[240px]">
                  {item.intendedAction}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-warden-surface-border/40">
                <span className="text-warden-text-muted">Guard Interception:</span>
                <span className="text-warden-status-allow font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {item.guardInterception}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
