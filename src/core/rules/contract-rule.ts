import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_UNAPPROVED_CONTRACT_ID = "RULE_UNAPPROVED_CONTRACT";

export class UnapprovedContractRule implements SecurityRule {
  readonly ruleId = RULE_UNAPPROVED_CONTRACT_ID;
  readonly name = "Contract Authorization Rule";
  readonly description = "Verifies that smart contract invocations target only approved contract addresses.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;

    // Only applies to contract call pathways
    if (action.pathway !== "FUNCTION_CALL" && action.pathway !== "NEP141_TRANSFER") {
      return {
        ruleId: this.ruleId,
        passed: true,
        decision: "ALLOW",
        severity: "info",
        reason: "Action is not a smart contract call; contract rule skipped.",
      };
    }

    const target = action.receiverId.trim().toLowerCase();
    const approvedContracts = policy.approvedContracts || [];
    const isApproved = approvedContracts.some(
      (c) => c.contractId.trim().toLowerCase() === target
    );

    if (!isApproved) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Target contract "${action.receiverId}" is not in the approved contracts registry.`,
        evidence: {
          ruleId: this.ruleId,
          category: "UNAPPROVED_CONTRACT",
          observed: action.receiverId,
          expected: approvedContracts.map((c) => c.contractId),
          description: `Attempted to invoke unapproved smart contract "${action.receiverId}".`,
        },
        suggestedRemediation: `Register "${action.receiverId}" in policy.approvedContracts with appropriate method restrictions.`,
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Contract "${action.receiverId}" is approved.`,
    };
  }
}
