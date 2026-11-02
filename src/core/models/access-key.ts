/**
 * WARDEN — Access Key Domain Models
 *
 * Models NEAR Protocol access key permissions, cryptographic signature schemes,
 * and scope boundaries.
 */

export type KeyType = "FullAccess" | "FunctionCall" | "Unknown";

export type SignatureScheme = "ed25519" | "secp256k1" | "ml-dsa-65-hash" | "unknown";

export interface FunctionCallPermission {
  receiverId: string;
  methodNames: string[]; // Empty array means UNRESTRICTED methods on receiverId
  allowance: string | null; // yoctoNEAR string, null means unlimited gas budget
}

export type KeyPermission =
  | { type: "FullAccess" }
  | { type: "FunctionCall"; functionCall: FunctionCallPermission }
  | { type: "Unknown"; rawPermission: Record<string, unknown> };

export interface AccessKey {
  publicKey: string;
  scheme: SignatureScheme;
  nonce: number;
  permission: KeyPermission;
}

export interface KeyRiskAnalysis {
  isFullAccess: boolean;
  isUnrestrictedMethods: boolean;
  isUnlimitedGasAllowance: boolean;
  isLowGasAllowance: boolean; // < 0.1 NEAR, lockout danger if sole key
  remainingAllowanceYocto?: string;
  riskSeverity: "SAFE" | "WARN" | "CRITICAL";
  riskDescription?: string;
}
