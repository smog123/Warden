import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";

export const RULE_SUSPICIOUS_COUNTERPARTY_ID = "RULE_SUSPICIOUS_COUNTERPARTY";

export class SuspiciousCounterpartyRule implements SecurityRule {
  readonly ruleId = RULE_SUSPICIOUS_COUNTERPARTY_ID;
  readonly name = "Counterparty Evidence & Reputation Rule";
  readonly description = "Assesses counterparty risk score, blocklist status, and smart contract code mutability.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, counterparty } = context;

    // If no counterparty assessment was provided, skip or pass if not available
    if (!counterparty) {
      return {
        ruleId: this.ruleId,
        passed: true,
        decision: "ALLOW",
        severity: "info",
        reason: "No counterparty reputation assessment provided; rule skipped.",
      };
    }

    // 1. Direct Threat Blocklist match -> instant BLOCK
    if (counterparty.threatBlocklistMatch) {
      const match = counterparty.threatBlocklistMatch;
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Counterparty "${counterparty.accountId}" matches known threat registry [${match.category}]. Forensic Tx: ${match.forensicTxHash}`,
        evidence: {
          ruleId: this.ruleId,
          category: "KNOWN_THREAT_BLOCKLIST",
          observed: match,
          expected: "No threat registry match",
          description: match.description,
        },
        suggestedRemediation: "Do not authorize transactions to this address. Address is flagged as malicious.",
      };
    }

    // 2. High Risk Score (>= 70) -> BLOCK
    if (counterparty.riskScore >= 70) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Counterparty "${counterparty.accountId}" has severe risk score of ${counterparty.riskScore}/100. Execution halted.`,
        evidence: {
          ruleId: this.ruleId,
          category: "HIGH_RISK_COUNTERPARTY",
          observed: counterparty.riskScore,
          expected: "< 70",
          description: `Cumulative signal penalty exceeds safe threshold. Signals: ${counterparty.signals.map((s) => s.name).join(", ")}`,
        },
        suggestedRemediation: "Verify counterparty legitimacy out-of-band before whitelisting.",
      };
    }

    // 3. Moderate Risk Score (>= 30) OR Code Modified Recently (< 72h) -> WARN
    if (counterparty.codeModifiedRecently) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "WARN",
        severity: "medium",
        reason: `Counterparty smart contract "${counterparty.accountId}" code was modified recently (< 72h). Potential rugpull / upgrade risk. Human verification required.`,
        evidence: {
          ruleId: this.ruleId,
          category: "RECENT_CODE_MUTATION",
          observed: "codeModifiedRecently: true",
          expected: "Stable code deployed > 72 hours ago",
          description: "Smart contract code hash changed within recent unannounced upgrade window.",
        },
        suggestedRemediation: "Conduct manual review of the new contract bytecode or audit diff before signing.",
      };
    }

    if (counterparty.riskScore >= 30) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "WARN",
        severity: "medium",
        reason: `Counterparty "${counterparty.accountId}" has elevated risk score of ${counterparty.riskScore}/100. Human confirmation recommended.`,
        evidence: {
          ruleId: this.ruleId,
          category: "ELEVATED_RISK_COUNTERPARTY",
          observed: counterparty.riskScore,
          expected: "< 30",
          description: `Signals: ${counterparty.signals.map((s) => s.name).join(", ")}`,
        },
        suggestedRemediation: "Review counterparty profile and confirm transfer intent.",
      };
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Counterparty "${counterparty.accountId}" passed reputation assessment (Score: ${counterparty.riskScore}/100).`,
    };
  }
}
