export type Severity = "low" | "medium" | "high" | "critical";

export type SecurityVerdict = "ALLOW" | "WARN" | "BLOCK";

export type ProvenanceType = "LIVE_NEAR_RPC" | "SIMULATED_TEST_FIXTURE";

export interface ProvenanceMetadata {
  dataSource: ProvenanceType;
  network: "testnet" | "mainnet";
  blockHeight?: number;
  blockTimestamp?: string;
  rpcEndpoint?: string;
  isSimulated: boolean;
  simulationScenarioId?: string;
}

export interface MetricSummary {
  walletsInspected: number;
  criticalFindings: number;
  highRiskPermissions: number;
  simulationsCompleted: number;
  blockedUnauthorizedActions: number;
}

export interface SecurityPosture {
  score: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "F";
  status: "OPTIMAL" | "ATTENTION_REQUIRED" | "COMPROMISED";
  activeGuardsCount: number;
  totalPoliciesActive: number;
  fullAccessViolationsCount: number;
  lastEvaluatedAt: string;
}

export interface KeyDistribution {
  fullAccess: number;
  functionCall: number;
  postQuantumHash: number;
  unrestrictedMethods: number;
}

export interface WalletAuditItem {
  id: string;
  accountId: string;
  balanceNear: string;
  keysCount: number;
  keyTypes: {
    fullAccess: number;
    functionCall: number;
    hasPostQuantum: boolean;
  };
  riskLevel: "SECURE" | "WARNING" | "CRITICAL";
  criticalFinding?: string;
  allowanceRisk: boolean;
  inspectedAt: string;
  provenance: ProvenanceMetadata;
}

export interface AttackLabFinding {
  id: string;
  scenarioId: string;
  scenarioName: string;
  vector: "PROMPT_INJECTION" | "SALAMI_SPLITTING" | "ADDRESS_HIJACK" | "FREEZE_EVASION" | "METHOD_SPOOF";
  targetAccount: string;
  intendedAction: string;
  verdict: SecurityVerdict;
  guardInterception: "HALTED_PRE_SIGNATURE" | "BLOCKED_BY_POLICY" | "PASSED_UNGUARDED";
  violationCode: string;
  timestamp: string;
  provenance: ProvenanceMetadata;
}

export interface SecurityActivity {
  id: string;
  timestamp: string;
  type: "AUDIT" | "INTERCEPTION" | "SIMULATION" | "POLICY_UPDATE" | "FREEZE_TOGGLE";
  accountId: string;
  summary: string;
  verdict?: SecurityVerdict;
  severity: "info" | "warn" | "critical" | "success";
  provenance: ProvenanceMetadata;
}
