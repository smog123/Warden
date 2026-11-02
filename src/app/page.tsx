import React from "react";
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  FlaskConical,
  ShieldCheck,
  Terminal,
  Info,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { PostureSummary } from "@/components/dashboard/PostureSummary";
import { PermissionDistribution } from "@/components/dashboard/PermissionDistribution";
import { LatestAuditResults } from "@/components/dashboard/LatestAuditResults";
import { RecentAttackFindings } from "@/components/dashboard/RecentAttackFindings";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  SAMPLE_METRICS,
  SAMPLE_POSTURE,
  SAMPLE_KEY_DISTRIBUTION,
  SAMPLE_RECENT_AUDITS,
  SAMPLE_ATTACK_FINDINGS,
  SAMPLE_RECENT_ACTIVITY,
} from "@/lib/constants";

export default function OverviewDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Banner declaring demo / simulated dataset context */}
      <div className="p-3.5 rounded-lg bg-warden-surface-card border border-warden-surface-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-warden-accent-muted border border-warden-accent-border text-warden-accent">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-warden-text-primary">
              Security Assurance Engine Active
            </span>
            <span className="text-warden-text-muted ml-2">
              Showing evaluated baseline metrics on NEAR Testnet. Live inspections query RPC directly.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-warden-text-muted">
          <span className="w-2 h-2 rounded-full bg-warden-status-allow" />
          RPC: 124ms
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Wallets Inspected"
          value={SAMPLE_METRICS.walletsInspected}
          subValue="accounts"
          trend={{ text: "Live testnet sample", type: "neutral" }}
          icon={Search}
          variant="default"
        />

        <StatCard
          label="Critical Findings"
          value={SAMPLE_METRICS.criticalFindings}
          subValue="violations"
          trend={{ text: "Needs immediate fix", type: "danger" }}
          icon={AlertTriangle}
          variant="critical"
        />

        <StatCard
          label="High-Risk Permissions"
          value={SAMPLE_METRICS.highRiskPermissions}
          subValue="keys"
          trend={{ text: "FullAccess on agents", type: "warning" }}
          icon={ShieldAlert}
          variant="warning"
        />

        <StatCard
          label="Simulations Completed"
          value={SAMPLE_METRICS.simulationsCompleted}
          subValue="runs"
          trend={{ text: "5 attack vectors", type: "neutral" }}
          icon={FlaskConical}
          variant="accent"
        />

        <StatCard
          label="Blocked Unauthorized"
          value={SAMPLE_METRICS.blockedUnauthorizedActions}
          subValue="intercepts"
          trend={{ text: "100% pre-sign halted", type: "positive" }}
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      {/* Quick Action Bar */}
      <QuickActions />

      {/* Primary Analytics Section: Posture & Permission Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PostureSummary posture={SAMPLE_POSTURE} />
        </div>
        <div>
          <PermissionDistribution distribution={SAMPLE_KEY_DISTRIBUTION} />
        </div>
      </div>

      {/* Operational Grids: Audits & Attack Laboratory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestAuditResults audits={SAMPLE_RECENT_AUDITS} />
        <RecentAttackFindings findings={SAMPLE_ATTACK_FINDINGS} />
      </div>

      {/* Activity Timeline */}
      <RecentActivityFeed activities={SAMPLE_RECENT_ACTIVITY} />
    </div>
  );
}
