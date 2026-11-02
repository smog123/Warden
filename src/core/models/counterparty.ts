export interface ThreatEvidence {
  incidentId: string;
  category: "PHISHING" | "DRAINER_CONTRACT" | "RUGPULL" | "MALICIOUS_UPGRADE" | "UNVERIFIED_HONEYPOT";
  forensicTxHash: string;
  source: string;
  reportedAt: string;
  description: string;
}

export interface CounterpartyAssessment {
  accountId: string;
  isContract: boolean;
  codeHash?: string;
  codeDeployedAtBlock?: number;
  codeModifiedRecently: boolean; // Modified < 72 hours ago
  accountAgeDays: number;
  priorInteractionsCount: number;
  totalHistoricalVolumeYocto: string;
  threatBlocklistMatch?: ThreatEvidence;
  riskScore: number; // 0 - 100
  recommendedVerdict: "ALLOW" | "WARN" | "BLOCK";
  signals: Array<{
    signalId: string;
    name: string;
    penalty: number;
    description: string;
  }>;
}
