export type TransactionPathway =
  | "NATIVE_TRANSFER"
  | "FUNCTION_CALL"
  | "INTENT_SWAP"
  | "NEP141_TRANSFER"
  | "META_TRANSACTION";

export interface ProposedAction {
  actionId: string;
  agentId: string;
  signerAccountId: string;
  receiverId: string;
  pathway: TransactionPathway;
  amountYocto: string; // Exact yoctoNEAR (use "0" if zero deposit)
  methodName?: string;
  args?: Record<string, unknown> | string;
  gasUnits?: string;
  timestamp: string; // ISO string
  metadata?: Record<string, unknown>;
}
