import { describe, it, expect } from "vitest";
import { PolicyEngine } from "../../src/core/engine/policy-engine";
import { ProposedAction, AgentPolicy, CounterpartyAssessment } from "../../src/core/models";
import { nearToYocto } from "../../src/core/math/yocto";

const policy: AgentPolicy = {
  policyId: "pol-prod-01",
  agentId: "defi-agent.testnet",
  version: "1.0",
  approvedRecipients: ["partner-dex.testnet", "oracle.testnet"],
  deniedRecipients: ["drainer.testnet"],
  approvedContracts: [
    {
      contractId: "partner-dex.testnet",
      allowedMethods: ["swap", "deposit"],
      requireZeroDeposit: true,
    },
  ],
  maxTransactionValueYocto: nearToYocto("10").toString(), // 10 NEAR
  dailySpendingThresholdYocto: nearToYocto("50").toString(), // 50 NEAR
  approvalThresholdYocto: nearToYocto("4").toString(), // 4 NEAR
  allowedPathways: ["NATIVE_TRANSFER", "FUNCTION_CALL", "INTENT_SWAP"],
  maxActionsPerHour: 5,
  expirationTimestamp: "2026-12-31T23:59:59Z",
  failClosed: true,
  emergencyFreeze: false,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

describe("PolicyEngine Central Evaluation Pipeline", () => {
  const engine = new PolicyEngine();

  it("ALLOWS a completely compliant transaction with zero violations", () => {
    const action: ProposedAction = {
      actionId: "act-clean-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "oracle.testnet",
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("2").toString(), // 2 NEAR (< 4 NEAR approval threshold)
      timestamp: "2026-11-01T14:00:00Z",
    };

    const decision = engine.evaluate(action, policy);

    expect(decision.decision).toBe("ALLOW");
    expect(decision.violatedRuleIds.length).toBe(0);
    expect(decision.satisfiedRuleIds.length).toBeGreaterThan(5);
    expect(decision.severity).toBe("info");
    expect(decision.reason).toContain("All");
    expect(decision.failClosedTriggered).toBe(false);
  });

  it("WARNS when transaction is valid but exceeds human approval threshold", () => {
    const action: ProposedAction = {
      actionId: "act-warn-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "oracle.testnet",
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("6").toString(), // 6 NEAR (> 4 NEAR approval threshold, <= 10 NEAR max)
      timestamp: "2026-11-01T14:00:00Z",
    };

    const decision = engine.evaluate(action, policy);

    expect(decision.decision).toBe("WARN");
    expect(decision.violatedRuleIds).toContain("RULE_EXCESSIVE_TRANSACTION_VALUE");
    expect(decision.severity).toBe("medium");
    expect(decision.suggestedRemediation).toContain("human supervisor");
  });

  it("BLOCKS when hard security invariant is breached (e.g. unapproved recipient)", () => {
    const action: ProposedAction = {
      actionId: "act-block-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "attacker-injected.testnet",
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("1").toString(),
      timestamp: "2026-11-01T14:00:00Z",
    };

    const decision = engine.evaluate(action, policy);

    expect(decision.decision).toBe("BLOCK");
    expect(decision.violatedRuleIds).toContain("RULE_UNAUTHORIZED_RECIPIENT");
    expect(decision.severity).toBe("high");
    expect(decision.evidence.length).toBeGreaterThan(0);
  });

  it("BLOCK overrides WARN when both occur in the same action", () => {
    // Action exceeds approval threshold (WARN) AND targets unapproved recipient (BLOCK)
    const action: ProposedAction = {
      actionId: "act-double-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "unapproved.testnet", // Triggers BLOCK
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("6").toString(), // Triggers WARN
      timestamp: "2026-11-01T14:00:00Z",
    };

    const decision = engine.evaluate(action, policy);

    expect(decision.decision).toBe("BLOCK");
    expect(decision.violatedRuleIds).toContain("RULE_UNAUTHORIZED_RECIPIENT");
    expect(decision.violatedRuleIds).toContain("RULE_EXCESSIVE_TRANSACTION_VALUE");
  });

  it("updates stateful spending accumulator correctly across hours and day rollover", () => {
    const action1: ProposedAction = {
      actionId: "act-seq-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "oracle.testnet",
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("5").toString(),
      timestamp: "2026-11-01T10:15:00Z",
    };

    const state1 = engine.updateSpendingState(undefined, action1, action1.timestamp);
    expect(state1.dateString).toBe("2026-11-01");
    expect(state1.accumulatedDailyYocto).toBe(nearToYocto("5").toString());
    expect(state1.actionsInCurrentHour).toBe(1);

    // Second action in same hour
    const action2: ProposedAction = {
      ...action1,
      actionId: "act-seq-2",
      amountYocto: nearToYocto("3").toString(),
      timestamp: "2026-11-01T10:45:00Z",
    };
    const state2 = engine.updateSpendingState(state1, action2, action2.timestamp);
    expect(state2.accumulatedDailyYocto).toBe(nearToYocto("8").toString());
    expect(state2.actionsInCurrentHour).toBe(2);

    // Third action in next hour
    const action3: ProposedAction = {
      ...action1,
      actionId: "act-seq-3",
      amountYocto: nearToYocto("2").toString(),
      timestamp: "2026-11-01T11:10:00Z",
    };
    const state3 = engine.updateSpendingState(state2, action3, action3.timestamp);
    expect(state3.accumulatedDailyYocto).toBe(nearToYocto("10").toString());
    expect(state3.actionsInCurrentHour).toBe(1); // Reset for new hour!

    // Fourth action on next day (UTC rollover)
    const action4: ProposedAction = {
      ...action1,
      actionId: "act-seq-4",
      amountYocto: nearToYocto("4").toString(),
      timestamp: "2026-11-02T01:00:00Z",
    };
    const state4 = engine.updateSpendingState(state3, action4, action4.timestamp);
    expect(state4.dateString).toBe("2026-11-02");
    expect(state4.accumulatedDailyYocto).toBe(nearToYocto("4").toString()); // Reset for new day!
    expect(state4.actionsInCurrentHour).toBe(1);
  });

  it("operates 100% deterministically without network, AI API or external state", () => {
    const action: ProposedAction = {
      actionId: "act-det-1",
      agentId: "defi-agent.testnet",
      signerAccountId: "defi-agent.testnet",
      receiverId: "oracle.testnet",
      pathway: "NATIVE_TRANSFER",
      amountYocto: nearToYocto("1").toString(),
      timestamp: "2026-11-01T12:00:00Z",
    };

    const d1 = engine.evaluate(action, policy, { evaluationTimestamp: "2026-11-01T12:00:00Z" });
    const d2 = engine.evaluate(action, policy, { evaluationTimestamp: "2026-11-01T12:00:00Z" });

    expect(d1.decision).toBe(d2.decision);
    expect(d1.reason).toBe(d2.reason);
    expect(d1.violatedRuleIds).toEqual(d2.violatedRuleIds);
    expect(d1.satisfiedRuleIds).toEqual(d2.satisfiedRuleIds);
  });
});
