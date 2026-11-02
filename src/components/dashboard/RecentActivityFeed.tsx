import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SecurityActivity } from "@/lib/types";
import { Activity, ShieldX, AlertTriangle, CheckCircle, Sliders } from "lucide-react";
import { SimulatedBadge } from "@/components/ui/Badge";

interface RecentActivityFeedProps {
  activities: SecurityActivity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getIcon = (type: SecurityActivity["type"], severity: SecurityActivity["severity"]) => {
    switch (severity) {
      case "critical":
        return <ShieldX className="w-3.5 h-3.5 text-warden-status-block shrink-0 mt-0.5" />;
      case "warn":
        return <AlertTriangle className="w-3.5 h-3.5 text-warden-status-warn shrink-0 mt-0.5" />;
      case "success":
        return <CheckCircle className="w-3.5 h-3.5 text-warden-status-allow shrink-0 mt-0.5" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-warden-accent shrink-0 mt-0.5" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Activity className="w-4 h-4 text-warden-accent" />
          Recent Security Activity
        </CardTitle>
        <SimulatedBadge />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              {getIcon(act.type, act.severity)}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-warden-text-primary text-[11px] font-semibold">
                    {act.accountId}
                  </span>
                  <span className="font-mono text-[10px] text-warden-text-muted">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-warden-text-secondary text-[11px] leading-relaxed">
                  {act.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
