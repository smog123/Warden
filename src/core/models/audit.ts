import { PolicyDecision } from "./decision";
import { SecurityFinding } from "./finding";

export type AuditEventType =
  | "DECISION"
  | "INSPECTION"
  | "SIMULATION"
  | "FREEZE_TOGGLED"
  | "POLICY_LOADED";

export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  agentId?: string;
  accountId?: string;
  decision?: PolicyDecision;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditReport {
  reportId: string;
  agentId: string;
  accountId: string;
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "F";
  findings: SecurityFinding[];
  simulationsPassed: number;
  simulationsTotal: number;
  sha256ProvenanceHash: string;
  generatedAt: string;
}
