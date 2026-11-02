import { TransactionPathway } from "./action";

export interface ApprovedContractConfig {
  contractId: string;
  allowedMethods: string[]; // Specific methods, or empty array meaning strict rejection of wildcard calls
  maxDepositYocto?: string;
  requireZeroDeposit?: boolean;
}

export interface AgentPolicy {
  policyId: string;
  agentId: string;
  version: string;
  
  // Recipient access control
  approvedRecipients: string[];
  deniedRecipients: string[];

  // Contract execution control
  approvedContracts: ApprovedContractConfig[];

  // Integer-safe financial limits (exact yoctoNEAR strings)
  maxTransactionValueYocto: string;
  dailySpendingThresholdYocto: string;
  approvalThresholdYocto: string; // Above this value triggers WARN (human-in-the-loop)

  // Pathway restrictions
  allowedPathways: TransactionPathway[];

  // Operational limits
  maxActionsPerHour?: number;
  
  // Expiration & Safety
  expirationTimestamp: string; // ISO 8601 string
  failClosed: boolean; // Must default to true
  emergencyFreeze: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface AccumulatedSpendingState {
  agentId: string;
  dateString: string; // YYYY-MM-DD (UTC)
  accumulatedDailyYocto: string;
  actionsInCurrentHour: number;
  lastActionTimestamp: string;
}
