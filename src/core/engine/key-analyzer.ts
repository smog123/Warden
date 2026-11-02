import {
  AccessKey,
  KeyRiskAnalysis,
  WalletAccount,
  AccountTopologyAnalysis,
  SignatureScheme,
} from "../models";
import { toBigIntYocto, YOCTO_PER_NEAR } from "../math/yocto";

// Less than 0.1 NEAR allowance is flagged as low (lockout risk if sole key)
export const CRITICAL_GAS_ALLOWANCE_THRESHOLD_YOCTO = YOCTO_PER_NEAR / 10n; // 0.1 Ⓝ

export function detectSignatureScheme(publicKey: string): SignatureScheme {
  if (publicKey.startsWith("ed25519:")) return "ed25519";
  if (publicKey.startsWith("secp256k1:")) return "secp256k1";
  if (publicKey.startsWith("ml-dsa-65-hash:") || publicKey.startsWith("ml-dsa-65:")) {
    return "ml-dsa-65-hash";
  }
  return "unknown";
}

export function analyzeAccessKeyRisk(key: AccessKey): KeyRiskAnalysis {
  if (key.permission.type === "FullAccess") {
    return {
      isFullAccess: true,
      isUnrestrictedMethods: false,
      isUnlimitedGasAllowance: true,
      isLowGasAllowance: false,
      riskSeverity: "CRITICAL",
      riskDescription:
        "Full-Access key detected. This grants unrestricted control to transfer all funds, add/delete keys, and delete the account. AI agents must NEVER hold Full-Access keys.",
    };
  }

  if (key.permission.type === "FunctionCall") {
    const fc = key.permission.functionCall;
    const isUnrestrictedMethods = !fc.methodNames || fc.methodNames.length === 0;
    const isUnlimitedGas = fc.allowance === null;

    let isLowAllowance = false;
    let allowanceRemaining: bigint | undefined;

    if (fc.allowance !== null) {
      try {
        allowanceRemaining = toBigIntYocto(fc.allowance);
        if (allowanceRemaining < CRITICAL_GAS_ALLOWANCE_THRESHOLD_YOCTO) {
          isLowAllowance = true;
        }
      } catch {
        isLowAllowance = true;
      }
    }

    if (isUnrestrictedMethods) {
      return {
        isFullAccess: false,
        isUnrestrictedMethods: true,
        isUnlimitedGasAllowance: isUnlimitedGas,
        isLowGasAllowance: isLowAllowance,
        remainingAllowanceYocto: fc.allowance || undefined,
        riskSeverity: "WARN",
        riskDescription: `Function-Call key allows calling ANY method (method_names: []) on contract "${fc.receiverId}". Method list should be explicitly restricted.`,
      };
    }

    if (isLowAllowance) {
      return {
        isFullAccess: false,
        isUnrestrictedMethods: false,
        isUnlimitedGasAllowance: false,
        isLowGasAllowance: true,
        remainingAllowanceYocto: fc.allowance || undefined,
        riskSeverity: "WARN",
        riskDescription: `Gas allowance is critically low (${fc.allowance} yoctoNEAR). When consumed, the key is permanently disabled.`,
      };
    }

    return {
      isFullAccess: false,
      isUnrestrictedMethods: false,
      isUnlimitedGasAllowance: isUnlimitedGas,
      isLowGasAllowance: false,
      remainingAllowanceYocto: fc.allowance || undefined,
      riskSeverity: "SAFE",
      riskDescription: `Scoped Function-Call key limited to contract "${fc.receiverId}" with ${fc.methodNames.length} allowed method(s).`,
    };
  }

  return {
    isFullAccess: false,
    isUnrestrictedMethods: false,
    isUnlimitedGasAllowance: false,
    isLowGasAllowance: false,
    riskSeverity: "WARN",
    riskDescription: "Unknown or unrecognized key permission structure.",
  };
}

export function analyzeAccountTopology(account: WalletAccount): AccountTopologyAnalysis {
  let fullAccessCount = 0;
  let functionCallCount = 0;
  let postQuantumCount = 0;
  let unrestrictedMethodsCount = 0;
  const findings: string[] = [];

  for (const key of account.accessKeys) {
    if (key.scheme === "ml-dsa-65-hash") {
      postQuantumCount++;
    }

    const risk = analyzeAccessKeyRisk(key);

    if (risk.isFullAccess) {
      fullAccessCount++;
      findings.push(`CRITICAL: Full-Access key found: ${key.publicKey}`);
    } else if (key.permission.type === "FunctionCall") {
      functionCallCount++;
      if (risk.isUnrestrictedMethods) {
        unrestrictedMethodsCount++;
        findings.push(
          `WARNING: Key ${key.publicKey} has unrestricted methods on contract "${key.permission.functionCall.receiverId}".`
        );
      }
      if (risk.isLowGasAllowance) {
        findings.push(
          `WARNING: Key ${key.publicKey} gas allowance near exhaustion.`
        );
      }
    }
  }

  const hasZeroFullAccessKeys = fullAccessCount === 0;
  // If an account has ONLY function-call keys and ANY of them have low allowances,
  // it faces permanent lockout if allowance runs out because it cannot add new keys!
  let hasPermanentLockoutRisk = false;
  if (hasZeroFullAccessKeys && functionCallCount > 0) {
    const hasAnyLowAllowance = account.accessKeys.some((k) => {
      const risk = analyzeAccessKeyRisk(k);
      return risk.isLowGasAllowance;
    });
    if (hasAnyLowAllowance) {
      hasPermanentLockoutRisk = true;
      findings.push(
        `CRITICAL LOCKOUT HAZARD: Account holds 0 Full-Access keys and gas allowances are depleted. Account cannot be recovered or sign new keys.`
      );
    }
  }

  let grade: "SECURE" | "WARNING" | "CRITICAL" = "SECURE";
  if (fullAccessCount > 0 || hasPermanentLockoutRisk) {
    grade = "CRITICAL";
  } else if (unrestrictedMethodsCount > 0 || findings.length > 0) {
    grade = "WARNING";
  }

  return {
    accountId: account.accountId,
    totalKeys: account.accessKeys.length,
    fullAccessKeysCount: fullAccessCount,
    functionCallKeysCount: functionCallCount,
    postQuantumKeysCount: postQuantumCount,
    hasZeroFullAccessKeys,
    hasPermanentLockoutRisk,
    unrestrictedMethodsKeysCount: unrestrictedMethodsCount,
    structuralRiskGrade: grade,
    structuralFindings: findings,
  };
}
