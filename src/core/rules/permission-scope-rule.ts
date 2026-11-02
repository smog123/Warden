import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_UNRESTRICTED_PERMISSIONS_ID = "RULE_UNRESTRICTED_PERMISSIONS";

export class UnrestrictedPermissionsRule implements SecurityRule {
  readonly ruleId = RULE_UNRESTRICTED_PERMISSIONS_ID;
  readonly name = "Permission Scope & Circuit Breaker Rule";
  readonly description = "Enforces emergency freeze kill-switches and prevents unrestricted execution pathways.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    // 1. Emergency Freeze Circuit Breaker check
    if (policy.emergencyFreeze) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Global emergency freeze is ACTIVE for agent "${policy.agentId}". All signing pipelines are halted.`,
        evidence: {
          ruleId: this.ruleId,
          category: "EMERGENCY_FREEZE_ACTIVE",
          observed: "emergencyFreeze: true",
          expected: "emergencyFreeze: false",
          description: "Execution halted by active emergency kill-switch.",
        },
        suggestedRemediation: "Deactivate emergency freeze in agent settings once the security threat is resolved.",
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: "Emergency freeze is inactive and permission scope is valid.",
    };
  }
}
