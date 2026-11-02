export type DecisionType = "ALLOW" | "WARN" | "BLOCK";

export type RuleSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface EvidenceItem {
  ruleId: string;
  category: string;
  observed: unknown;
  expected: unknown;
  description: string;
}

export interface PolicyDecision {
  decisionId: string;
  actionId: string;
  agentId: string;
  decision: DecisionType;
  reason: string;
  violatedRuleIds: string[];
  satisfiedRuleIds: string[];
  evidence: EvidenceItem[];
  severity: RuleSeverity;
  timestamp: string; // ISO 8601 string
  suggestedRemediation?: string;
  failClosedTriggered: boolean;
}
