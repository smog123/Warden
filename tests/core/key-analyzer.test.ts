import { describe, it, expect } from "vitest";
import {
  detectSignatureScheme,
  analyzeAccessKeyRisk,
  analyzeAccountTopology,
} from "../../src/core/engine/key-analyzer";
import { AccessKey, WalletAccount } from "../../src/core/models";
import { nearToYocto } from "../../src/core/math/yocto";

describe("Access Key Risk & Topology Analyzer", () => {
  it("detects cryptographic signature schemes correctly", () => {
    expect(detectSignatureScheme("ed25519:6E8sCwEmT89WdNWnhQyZ")).toBe("ed25519");
    expect(detectSignatureScheme("secp256k1:3uK8yY9D...").startsWith("secp256k1")).toBe(true);
    expect(detectSignatureScheme("ml-dsa-65-hash:7Xx2X...")).toBe("ml-dsa-65-hash");
    expect(detectSignatureScheme("rsa:unknown...")).toBe("unknown");
  });

  it("flags Full-Access keys as CRITICAL risk for autonomous agents", () => {
    const fullAccessKey: AccessKey = {
      publicKey: "ed25519:8wZ7bC4p3V...",
      scheme: "ed25519",
      nonce: 10,
      permission: { type: "FullAccess" },
    };

    const analysis = analyzeAccessKeyRisk(fullAccessKey);
    expect(analysis.isFullAccess).toBe(true);
    expect(analysis.riskSeverity).toBe("CRITICAL");
    expect(analysis.riskDescription).toContain("Full-Access key detected");
  });

  it("flags Function-Call keys with empty method list as unrestricted WARNING", () => {
    const wildcardKey: AccessKey = {
      publicKey: "ed25519:wildcard...",
      scheme: "ed25519",
      nonce: 1,
      permission: {
        type: "FunctionCall",
        functionCall: {
          receiverId: "dex.testnet",
          methodNames: [], // Wildcard!
          allowance: nearToYocto("5").toString(),
        },
      },
    };

    const analysis = analyzeAccessKeyRisk(wildcardKey);
    expect(analysis.isUnrestrictedMethods).toBe(true);
    expect(analysis.riskSeverity).toBe("WARN");
    expect(analysis.riskDescription).toContain("ANY method");
  });

  it("identifies properly scoped Function-Call keys as SAFE", () => {
    const safeKey: AccessKey = {
      publicKey: "ed25519:safekey...",
      scheme: "ed25519",
      nonce: 4,
      permission: {
        type: "FunctionCall",
        functionCall: {
          receiverId: "market.testnet",
          methodNames: ["submit_quote", "cancel_quote"],
          allowance: nearToYocto("10").toString(),
        },
      },
    };

    const analysis = analyzeAccessKeyRisk(safeKey);
    expect(analysis.riskSeverity).toBe("SAFE");
    expect(analysis.isUnrestrictedMethods).toBe(false);
    expect(analysis.isFullAccess).toBe(false);
  });

  it("detects permanent lockout hazard when account has 0 FullAccess keys and low allowance", () => {
    const depletedKey: AccessKey = {
      publicKey: "ed25519:depleted...",
      scheme: "ed25519",
      nonce: 200,
      permission: {
        type: "FunctionCall",
        functionCall: {
          receiverId: "agent-target.testnet",
          methodNames: ["tick"],
          allowance: nearToYocto("0.02").toString(), // < 0.1 NEAR!
        },
      },
    };

    const account: WalletAccount = {
      accountId: "isolated-bot.testnet",
      addressType: "sub-account",
      balanceYocto: nearToYocto("50").toString(),
      storageUsageBytes: 4000,
      accessKeys: [depletedKey],
      isContract: false,
    };

    const topology = analyzeAccountTopology(account);
    expect(topology.hasZeroFullAccessKeys).toBe(true);
    expect(topology.hasPermanentLockoutRisk).toBe(true);
    expect(topology.structuralRiskGrade).toBe("CRITICAL");
    expect(topology.structuralFindings.some((f) => f.includes("LOCKOUT HAZARD"))).toBe(true);
  });
});
