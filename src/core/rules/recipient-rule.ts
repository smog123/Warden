import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_UNAUTHORIZED_RECIPIENT_ID = "RULE_UNAUTHORIZED_RECIPIENT";

export class UnauthorizedRecipientRule implements SecurityRule {
  readonly ruleId = RULE_UNAUTHORIZED_RECIPIENT_ID;
  readonly name = "Recipient Authorization Rule";
  readonly description = "Enforces approved recipient whitelists and explicit denial blacklists.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy } = context;
    const recipient = action.receiverId.trim().toLowerCase();

    // 1. Explicit denial list check
    const denied = (policy.deniedRecipients || []).map((r) => r.trim().toLowerCase());
    if (denied.includes(recipient)) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Target recipient "${action.receiverId}" is explicitly blacklisted by agent policy.`,
        evidence: {
          ruleId: this.ruleId,
          category: "DENIED_RECIPIENT",
          observed: action.receiverId,
          expected: "Not in deniedRecipients list",
          description: `Recipient ${action.receiverId} matched active blacklisted destination.`,
        },
        suggestedRemediation: "Remove the address from deniedRecipients or route to an approved destination.",
      };
    }

    // 2. Whitelist check (if approved list is configured)
    const approved = (policy.approvedRecipients || []).map((r) => r.trim().toLowerCase());
    if (approved.length > 0 && !approved.includes(recipient)) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "high",
        reason: `Target recipient "${action.receiverId}" is not in the approved whitelist.`,
        evidence: {
          ruleId: this.ruleId,
          category: "UNAPPROVED_RECIPIENT",
          observed: action.receiverId,
          expected: approved,
          description: `Action destination does not match any approved recipient in policy whitelist.`,
        },
        suggestedRemediation: `Add "${action.receiverId}" to approvedRecipients in agent policy if this transfer is legitimate.`,
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Recipient "${action.receiverId}" satisfies authorization policy.`,
    };
  }
}
