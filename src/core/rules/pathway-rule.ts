import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_UNRECOGNIZED_PATHWAY_ID = "RULE_UNRECOGNIZED_PATHWAY";

export class UnrecognizedPathwayRule implements SecurityRule {
  readonly ruleId = RULE_UNRECOGNIZED_PATHWAY_ID;
  readonly name = "Transaction Pathway Authorization Rule";
  readonly description = "Restricts agent execution to explicitly authorized blockchain transaction pathways.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    const allowedPathways = policy.allowedPathways || [];

    if (!allowedPathways.includes(action.pathway)) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Transaction pathway "${action.pathway}" is not authorized by the agent policy.`,
        evidence: {
          ruleId: this.ruleId,
          category: "UNAUTHORIZED_PATHWAY",
          observed: action.pathway,
          expected: allowedPathways,
          description: `Action attempted to execute through unauthorized transaction pathway "${action.pathway}".`,
        },
        suggestedRemediation: `Authorize "${action.pathway}" in policy.allowedPathways if this operational channel is intended.`,
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Transaction pathway "${action.pathway}" is authorized.`,
    };
  }
}
