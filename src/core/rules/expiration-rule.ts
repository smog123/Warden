import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_EXPIRED_AUTHORIZATION_ID = "RULE_EXPIRED_AUTHORIZATION";

export class ExpiredAuthorizationRule implements SecurityRule {
  readonly ruleId = RULE_EXPIRED_AUTHORIZATION_ID;
  readonly name = "Policy Expiration Rule";
  readonly description = "Verifies that the agent authorization policy has not expired.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { policy, evaluationTimestamp, action } = context;

    if (!policy.expirationTimestamp) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: "Policy is missing required expirationTimestamp (fail-closed requirement).",
        suggestedRemediation: "Set an explicit expirationTimestamp on the agent policy.",
      };
    }

    const nowIso = evaluationTimestamp || action.timestamp || new Date().toISOString();
    const currentEpoch = new Date(nowIso).getTime();
    const expirationEpoch = new Date(policy.expirationTimestamp).getTime();

    if (isNaN(expirationEpoch)) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Invalid ISO format for policy.expirationTimestamp: "${policy.expirationTimestamp}"`,
        suggestedRemediation: "Provide a valid ISO 8601 timestamp string for expirationTimestamp.",
      };
    }

    if (currentEpoch > expirationEpoch) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Agent policy expired on ${policy.expirationTimestamp}. Current evaluation time: ${nowIso}.`,
        evidence: {
          ruleId: this.ruleId,
          category: "POLICY_EXPIRED",
          observed: nowIso,
          expected: `< ${policy.expirationTimestamp}`,
          description: "Execution rejected due to expired agent authorization lease.",
        },
        suggestedRemediation: "Renew and resign the agent policy with a future expiration timestamp.",
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Policy authorization is active (expires ${policy.expirationTimestamp}).`,
    };
  }
}
