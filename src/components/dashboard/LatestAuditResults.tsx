import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, SimulatedBadge } from "@/components/ui/Badge";
import { WalletAuditItem } from "@/lib/types";
import { Search, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

interface LatestAuditResultsProps {
  audits: WalletAuditItem[];
}

export function LatestAuditResults({ audits }: LatestAuditResultsProps) {
  const getRiskBadge = (level: WalletAuditItem["riskLevel"]) => {
    switch (level) {
      case "SECURE":
        return <Badge variant="allow">SECURE</Badge>;
      case "WARNING":
        return <Badge variant="warn">WARNING</Badge>;
      case "CRITICAL":
        return <Badge variant="block">CRITICAL</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          <Search className="w-4 h-4 text-warden-accent" />
          Latest Audit Results
        </CardTitle>
        <Link
          href="/inspector"
          className="text-xs font-mono text-warden-accent hover:underline flex items-center gap-1"
        >
          Open Inspector <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warden-surface-border text-warden-text-muted font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Account ID</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold">Keys</th>
                <th className="pb-3 font-semibold">Risk Level</th>
                <th className="pb-3 font-semibold text-right">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warden-surface-border/50 font-mono">
              {audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-warden-surface-elevated/40 transition-colors">
                  <td className="py-3 font-medium text-warden-text-primary">
                    <div className="flex items-center gap-1.5">
                      {audit.riskLevel === "CRITICAL" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-warden-status-block shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-warden-status-allow shrink-0" />
                      )}
                      <span>{audit.accountId}</span>
                    </div>
                    {audit.criticalFinding && (
                      <p className="text-[10px] font-sans text-warden-text-muted mt-0.5 line-clamp-1">
                        {audit.criticalFinding}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-warden-text-secondary whitespace-nowrap">
                    {audit.balanceNear} Ⓝ
                  </td>
                  <td className="py-3 text-warden-text-secondary whitespace-nowrap">
                    <span>{audit.keysCount} keys</span>
                    {audit.keyTypes.fullAccess > 0 && (
                      <span className="text-[10px] text-warden-status-block ml-1">
                        ({audit.keyTypes.fullAccess} FA)
                      </span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {getRiskBadge(audit.riskLevel)}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <SimulatedBadge />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
