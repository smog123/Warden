import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";
import { toBigIntYocto, yoctoToNear, isGreaterThan } from "../math/yocto";

export const RULE_EXCESSIVE_TRANSACTION_VALUE_ID = "RULE_EXCESSIVE_TRANSACTION_VALUE";

export class ExcessiveTransactionValueRule implements SecurityRule {
  readonly ruleId = RULE_EXCESSIVE_TRANSACTION_VALUE_ID;
  readonly name = "Single Transaction Value Limit Rule";
  readonly description = "Enforces hard ceilings and human-in-the-loop approval thresholds on transaction value.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    let actionValue: bigint;
    let maxValue: bigint;
    let approvalThreshold: bigint;

    try {
      actionValue = toBigIntYocto(action.amountYocto || "0");
      maxValue = toBigIntYocto(policy.maxTransactionValueYocto);
      approvalThreshold = toBigIntYocto(policy.approvalThresholdYocto);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Integer financial parsing error: ${msg}`,
        suggestedRemediation: "Ensure all transaction and policy values are valid non-negative integer strings.",
      };
    }

    // 1. Hard maximum ceiling check -> BLOCK
    if (actionValue > maxValue) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Transaction value of ${yoctoToNear(actionValue)} Ⓝ exceeds the maximum allowed per-transaction ceiling of ${yoctoToNear(maxValue)} Ⓝ.`,
        evidence: {
          ruleId: this.ruleId,
          category: "EXCESSIVE_VALUE",
          observed: action.amountYocto,
          expected: policy.maxTransactionValueYocto,
          description: `Action deposit exceeds single transaction hard ceiling.`,
        },
        suggestedRemediation: `Reduce the transaction amount below ${yoctoToNear(maxValue)} Ⓝ or update policy.maxTransactionValueYocto.`,
      };
    }

    // 2. Human-in-the-loop approval threshold check -> WARN
    if (actionValue > approvalThreshold) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "WARN",
        severity: "medium",
        reason: `Transaction value of ${yoctoToNear(actionValue)} Ⓝ exceeds the approval threshold (${yoctoToNear(approvalThreshold)} Ⓝ) and requires human review.`,
        evidence: {
          ruleId: this.ruleId,
          category: "APPROVAL_THRESHOLD_EXCEEDED",
          observed: action.amountYocto,
          expected: policy.approvalThresholdYocto,
          description: `Action requires explicit human confirmation prior to cryptographic signing.`,
        },
        suggestedRemediation: "Escalate transaction to human supervisor for cryptographic approval.",
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Transaction value of ${yoctoToNear(actionValue)} Ⓝ satisfies transaction ceiling limits.`,
    };
  }
}
