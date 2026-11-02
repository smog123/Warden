import { AccessKey } from "./access-key";

export type AccountAddressType = "named" | "implicit" | "sub-account";

export interface WalletAccount {
  accountId: string;
  addressType: AccountAddressType;
  balanceYocto: string; // Exact yoctoNEAR
  storageUsageBytes: number;
  accessKeys: AccessKey[];
  isContract: boolean;
  codeHash?: string;
  blockHeight?: number;
}

export interface AccountTopologyAnalysis {
  accountId: string;
  totalKeys: number;
  fullAccessKeysCount: number;
  functionCallKeysCount: number;
  postQuantumKeysCount: number;
  hasZeroFullAccessKeys: boolean;
  hasPermanentLockoutRisk: boolean;
  unrestrictedMethodsKeysCount: number;
  structuralRiskGrade: "SECURE" | "WARNING" | "CRITICAL";
  structuralFindings: string[];
}
