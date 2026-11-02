import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_POLICY_COMPLETENESS_ID = "RULE_POLICY_COMPLETENESS";

export class PolicyCompletenessRule implements SecurityRule {
  readonly ruleId = RULE_POLICY_COMPLETENESS_ID;
  readonly name = "Policy Completeness & Fail-Closed Invariant Rule";
  readonly description = "Enforces fail-closed operation if required policy structures or action payloads are missing or incomplete.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    const missingPolicyFields: string[] = [];
    if (!policy.policyId) missingPolicyFields.push("policyId");
    if (!policy.agentId) missingPolicyFields.push("agentId");
    if (!policy.maxTransactionValueYocto) missingPolicyFields.push("maxTransactionValueYocto");
    if (!policy.dailySpendingThresholdYocto) missingPolicyFields.push("dailySpendingThresholdYocto");
    if (!policy.allowedPathways || policy.allowedPathways.length === 0) missingPolicyFields.push("allowedPathways");

    if (missingPolicyFields.length > 0) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Policy fails completeness check. Missing required fields: [${missingPolicyFields.join(", ")}]. Fail-closed protection active.`,
        evidence: {
          ruleId: this.ruleId,
          category: "INCOMPLETE_POLICY",
          observed: missingPolicyFields,
          expected: "Complete policy with all structural fields",
          description: "Policy rejected due to incomplete authorization parameters.",
        },
        suggestedRemediation: "Provide a complete policy configuration with all mandatory fields populated.",
      };
    }

    const missingActionFields: string[] = [];
    if (!action.actionId) missingActionFields.push("actionId");
    if (!action.receiverId) missingActionFields.push("receiverId");
    if (!action.pathway) missingActionFields.push("pathway");
    if (action.amountYocto === undefined || action.amountYocto === null) missingActionFields.push("amountYocto");

    if (missingActionFields.length > 0) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "high",
        reason: `Proposed action is incomplete. Missing required fields: [${missingActionFields.join(", ")}].`,
        suggestedRemediation: "Supply all required action fields before submitting for policy evaluation.",
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: "Policy and action structures satisfy completeness invariants.",
    };
  }
}
