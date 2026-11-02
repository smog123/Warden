import { describe, it, expect } from "vitest";
import {
  UnauthorizedRecipientRule,
  UnapprovedContractRule,
  UnapprovedMethodRule,
  ExcessiveTransactionValueRule,
  SpendingLimitExhaustionRule,
  ExpiredAuthorizationRule,
  UnrecognizedPathwayRule,
  UnrestrictedPermissionsRule,
  PolicyCompletenessRule,
  SuspiciousCounterpartyRule,
} from "../../src/core/rules";
import { ProposedAction, AgentPolicy, CounterpartyAssessment } from "../../src/core/models";
import { nearToYocto } from "../../src/core/math/yocto";

const basePolicy: AgentPolicy = {
  policyId: "pol-test-1",
  agentId: "agent-test.testnet",
  version: "1.0",
  approvedRecipients: ["alice.testnet", "bob.testnet"],
  deniedRecipients: ["attacker.testnet", "drainer.testnet"],
  approvedContracts: [
    {
      contractId: "dex.testnet",
      allowedMethods: ["swap", "deposit"],
      requireZeroDeposit: true,
    },
    {
      contractId: "wrap.testnet",
      allowedMethods: ["near_deposit"],
      requireZeroDeposit: false,
    },
  ],
  maxTransactionValueYocto: nearToYocto("10").toString(), // 10 NEAR
  dailySpendingThresholdYocto: nearToYocto("50").toString(), // 50 NEAR
  approvalThresholdYocto: nearToYocto("5").toString(), // 5 NEAR (above this requires WARN)
  allowedPathways: ["NATIVE_TRANSFER", "FUNCTION_CALL", "INTENT_SWAP"],
  maxActionsPerHour: 10,
  expirationTimestamp: "2026-12-31T23:59:59Z",
  failClosed: true,
  emergencyFreeze: false,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

const baseAction: ProposedAction = {
  actionId: "act-1",
  agentId: "agent-test.testnet",
  signerAccountId: "agent-test.testnet",
  receiverId: "alice.testnet",
  pathway: "NATIVE_TRANSFER",
  amountYocto: nearToYocto("1").toString(),
  timestamp: "2026-11-01T12:00:00Z",
};

describe("Security Rules Unit Tests", () => {
  describe("UnauthorizedRecipientRule", () => {
    const rule = new UnauthorizedRecipientRule();

    it("BLOCKS when recipient is in deniedRecipients list", () => {
      const action = { ...baseAction, receiverId: "attacker.testnet" };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.severity).toBe("critical");
      expect(res.reason).toContain("explicitly blacklisted");
    });

    it("BLOCKS when recipient is not in approvedRecipients whitelist", () => {
      const action = { ...baseAction, receiverId: "charlie.testnet" };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.severity).toBe("high");
      expect(res.reason).toContain("not in the approved whitelist");
    });

    it("ALLOWS when recipient is in approvedRecipients list", () => {
      const action = { ...baseAction, receiverId: "alice.testnet" };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("UnapprovedContractRule", () => {
    const rule = new UnapprovedContractRule();

    it("BLOCKS function calls targeting unapproved contracts", () => {
      const action: ProposedAction = {
        ...baseAction,
        receiverId: "malicious-pool.testnet",
        pathway: "FUNCTION_CALL",
        methodName: "deposit",
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("not in the approved contracts registry");
    });

    it("ALLOWS function calls to approved contracts", () => {
      const action: ProposedAction = {
        ...baseAction,
        receiverId: "dex.testnet",
        pathway: "FUNCTION_CALL",
        methodName: "swap",
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });

    it("skips non-contract actions like NATIVE_TRANSFER", () => {
      const res = rule.evaluate({ action: baseAction, policy: basePolicy });
      expect(res.passed).toBe(true);
    });
  });

  describe("UnapprovedMethodRule", () => {
    const rule = new UnapprovedMethodRule();

    it("BLOCKS methods not in the approved contract method list", () => {
      const action: ProposedAction = {
        ...baseAction,
        receiverId: "dex.testnet",
        pathway: "FUNCTION_CALL",
        methodName: "drain_pool", // Not in ["swap", "deposit"]
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("not in the approved methods list");
    });

    it("BLOCKS when attached deposit > 0 on contracts requiring zero deposit", () => {
      const action: ProposedAction = {
        ...baseAction,
        receiverId: "dex.testnet",
        pathway: "FUNCTION_CALL",
        methodName: "swap",
        amountYocto: nearToYocto("1").toString(), // dex.testnet requires zero deposit!
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("requires zero attached deposit");
    });

    it("ALLOWS approved methods with matching deposit requirements", () => {
      const action: ProposedAction = {
        ...baseAction,
        receiverId: "wrap.testnet",
        pathway: "FUNCTION_CALL",
        methodName: "near_deposit",
        amountYocto: nearToYocto("2").toString(),
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("ExcessiveTransactionValueRule", () => {
    const rule = new ExcessiveTransactionValueRule();

    it("BLOCKS when transaction exceeds maxTransactionValue ceiling", () => {
      const action = { ...baseAction, amountYocto: nearToYocto("15").toString() }; // Max is 10 NEAR
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.severity).toBe("critical");
      expect(res.reason).toContain("exceeds the maximum allowed per-transaction ceiling");
    });

    it("WARNS when transaction exceeds approvalThreshold (requires human confirmation)", () => {
      const action = { ...baseAction, amountYocto: nearToYocto("7").toString() }; // Threshold is 5 NEAR, max is 10 NEAR
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("WARN");
      expect(res.severity).toBe("medium");
      expect(res.reason).toContain("requires human review");
    });

    it("ALLOWS when transaction is below approval threshold", () => {
      const action = { ...baseAction, amountYocto: nearToYocto("2").toString() }; // < 5 NEAR
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("SpendingLimitExhaustionRule", () => {
    const rule = new SpendingLimitExhaustionRule();

    it("BLOCKS when cumulative spending exceeds daily ceiling (50 NEAR)", () => {
      const spendingState = {
        agentId: "agent-test.testnet",
        dateString: "2026-11-01",
        accumulatedDailyYocto: nearToYocto("45").toString(),
        actionsInCurrentHour: 2,
        lastActionTimestamp: "2026-11-01T11:00:00Z",
      };
      // 45 + 8 = 53 > 50 NEAR daily limit
      const action = { ...baseAction, amountYocto: nearToYocto("8").toString() };
      const res = rule.evaluate({ action, policy: basePolicy, spendingState });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("breach the daily aggregate spending limit");
    });

    it("BLOCKS when actions per hour rate limit is exhausted (Salami attack defense)", () => {
      const spendingState = {
        agentId: "agent-test.testnet",
        dateString: "2026-11-01",
        accumulatedDailyYocto: nearToYocto("10").toString(),
        actionsInCurrentHour: 10, // Max allowed is 10!
        lastActionTimestamp: "2026-11-01T11:00:00Z",
      };
      const res = rule.evaluate({ action: baseAction, policy: basePolicy, spendingState });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("Hourly transaction rate limit exceeded");
    });

    it("ALLOWS when within daily and hourly limits", () => {
      const spendingState = {
        agentId: "agent-test.testnet",
        dateString: "2026-11-01",
        accumulatedDailyYocto: nearToYocto("10").toString(),
        actionsInCurrentHour: 3,
        lastActionTimestamp: "2026-11-01T11:00:00Z",
      };
      const res = rule.evaluate({ action: baseAction, policy: basePolicy, spendingState });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("ExpiredAuthorizationRule", () => {
    const rule = new ExpiredAuthorizationRule();

    it("BLOCKS when current timestamp is past policy expiration", () => {
      const expiredPolicy: AgentPolicy = {
        ...basePolicy,
        expirationTimestamp: "2026-01-01T00:00:00Z",
      };
      const res = rule.evaluate({
        action: baseAction,
        policy: expiredPolicy,
        evaluationTimestamp: "2026-11-01T12:00:00Z",
      });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("Agent policy expired");
    });

    it("ALLOWS when policy is still valid", () => {
      const res = rule.evaluate({
        action: baseAction,
        policy: basePolicy,
        evaluationTimestamp: "2026-11-01T12:00:00Z",
      });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("UnrecognizedPathwayRule", () => {
    const rule = new UnrecognizedPathwayRule();

    it("BLOCKS pathways not listed in allowedPathways", () => {
      const action: ProposedAction = {
        ...baseAction,
        pathway: "META_TRANSACTION", // Not in ["NATIVE_TRANSFER", "FUNCTION_CALL", "INTENT_SWAP"]
      };
      const res = rule.evaluate({ action, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("pathway \"META_TRANSACTION\" is not authorized");
    });

    it("ALLOWS authorized pathways", () => {
      const res = rule.evaluate({ action: baseAction, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("UnrestrictedPermissionsRule (Emergency Freeze)", () => {
    const rule = new UnrestrictedPermissionsRule();

    it("BLOCKS immediately when emergency freeze is active", () => {
      const frozenPolicy: AgentPolicy = { ...basePolicy, emergencyFreeze: true };
      const res = rule.evaluate({ action: baseAction, policy: frozenPolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.severity).toBe("critical");
      expect(res.reason).toContain("emergency freeze is ACTIVE");
    });

    it("ALLOWS when emergency freeze is inactive", () => {
      const res = rule.evaluate({ action: baseAction, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("PolicyCompletenessRule (Fail-Closed)", () => {
    const rule = new PolicyCompletenessRule();

    it("BLOCKS when mandatory policy fields are missing", () => {
      const brokenPolicy = { ...basePolicy, dailySpendingThresholdYocto: "" };
      const res = rule.evaluate({ action: baseAction, policy: brokenPolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("Missing required fields");
    });

    it("BLOCKS when proposed action is incomplete", () => {
      const incompleteAction = { ...baseAction, receiverId: "" };
      const res = rule.evaluate({ action: incompleteAction, policy: basePolicy });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("Proposed action is incomplete");
    });

    it("ALLOWS when both policy and action are complete", () => {
      const res = rule.evaluate({ action: baseAction, policy: basePolicy });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });

  describe("SuspiciousCounterpartyRule", () => {
    const rule = new SuspiciousCounterpartyRule();

    it("BLOCKS immediately if counterparty matches forensic threat blocklist", () => {
      const counterparty: CounterpartyAssessment = {
        accountId: "drainer.testnet",
        isContract: true,
        accountAgeDays: 5,
        priorInteractionsCount: 0,
        totalHistoricalVolumeYocto: "0",
        codeModifiedRecently: false,
        threatBlocklistMatch: {
          incidentId: "INC-991",
          category: "DRAINER_CONTRACT",
          forensicTxHash: "9xZz91Y...",
          source: "NearSec Threat Feed",
          reportedAt: "2026-10-30",
          description: "Phishing balance drainer contract",
        },
        riskScore: 100,
        recommendedVerdict: "BLOCK",
        signals: [],
      };

      const res = rule.evaluate({ action: baseAction, policy: basePolicy, counterparty });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.severity).toBe("critical");
      expect(res.reason).toContain("matches known threat registry [DRAINER_CONTRACT]");
    });

    it("BLOCKS if counterparty risk score >= 70", () => {
      const counterparty: CounterpartyAssessment = {
        accountId: "sketchy.testnet",
        isContract: false,
        accountAgeDays: 0,
        priorInteractionsCount: 0,
        totalHistoricalVolumeYocto: "0",
        codeModifiedRecently: false,
        riskScore: 85,
        recommendedVerdict: "BLOCK",
        signals: [{ signalId: "SIG_AGE", name: "Fresh Account", penalty: 70, description: "Created 2 hours ago" }],
      };

      const res = rule.evaluate({ action: baseAction, policy: basePolicy, counterparty });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("BLOCK");
      expect(res.reason).toContain("severe risk score of 85/100");
    });

    it("WARNS if counterparty smart contract code was modified recently (< 72h)", () => {
      const counterparty: CounterpartyAssessment = {
        accountId: "defi-vault.testnet",
        isContract: true,
        accountAgeDays: 120,
        priorInteractionsCount: 5,
        totalHistoricalVolumeYocto: nearToYocto("100").toString(),
        codeModifiedRecently: true, // Mutated!
        riskScore: 25,
        recommendedVerdict: "WARN",
        signals: [],
      };

      const res = rule.evaluate({ action: baseAction, policy: basePolicy, counterparty });
      expect(res.passed).toBe(false);
      expect(res.decision).toBe("WARN");
      expect(res.severity).toBe("medium");
      expect(res.reason).toContain("code was modified recently (< 72h)");
    });

    it("ALLOWS safe counterparty", () => {
      const counterparty: CounterpartyAssessment = {
        accountId: "verified-dao.testnet",
        isContract: true,
        accountAgeDays: 300,
        priorInteractionsCount: 12,
        totalHistoricalVolumeYocto: nearToYocto("500").toString(),
        codeModifiedRecently: false,
        riskScore: 5,
        recommendedVerdict: "ALLOW",
        signals: [],
      };

      const res = rule.evaluate({ action: baseAction, policy: basePolicy, counterparty });
      expect(res.passed).toBe(true);
      expect(res.decision).toBe("ALLOW");
    });
  });
});
