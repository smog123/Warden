import {
  ProposedAction,
  AgentPolicy,
  CounterpartyAssessment,
  AccumulatedSpendingState,
  PolicyDecision,
  DecisionType,
  RuleSeverity,
  EvidenceItem,
} from "../models";
import {
  SecurityRule,
  RuleEvaluationContext,
  RuleEvaluationResult,
  PolicyCompletenessRule,
  UnrestrictedPermissionsRule,
  ExpiredAuthorizationRule,
  UnrecognizedPathwayRule,
  UnauthorizedRecipientRule,
  UnapprovedContractRule,
  UnapprovedMethodRule,
  ExcessiveTransactionValueRule,
  SpendingLimitExhaustionRule,
  SuspiciousCounterpartyRule,
} from "../rules";
import { toBigIntYocto } from "../math/yocto";

export interface PolicyEngineOptions {
  customRules?: SecurityRule[];
}

export class PolicyEngine {
  private rules: SecurityRule[];

  constructor(options?: PolicyEngineOptions) {
    // Default deterministic rules ordered by defensive priority
    this.rules = options?.customRules || [
      new PolicyCompletenessRule(),
      new UnrestrictedPermissionsRule(),
      new ExpiredAuthorizationRule(),
      new UnrecognizedPathwayRule(),
      new UnauthorizedRecipientRule(),
      new UnapprovedContractRule(),
      new UnapprovedMethodRule(),
      new ExcessiveTransactionValueRule(),
      new SpendingLimitExhaustionRule(),
      new SuspiciousCounterpartyRule(),
    ];
  }

  /**
   * Deterministically evaluates a proposed action against an agent's policy.
   * Completely independent of any AI API or non-deterministic heuristic.
   */
  public evaluate(
    action: ProposedAction,
    policy: AgentPolicy,
    options?: {
      spendingState?: AccumulatedSpendingState;
      counterparty?: CounterpartyAssessment;
      evaluationTimestamp?: string;
    }
  ): PolicyDecision {
    const timestamp = options?.evaluationTimestamp || action.timestamp || new Date().toISOString();
    const context: RuleEvaluationContext = {
      action,
      policy,
      spendingState: options?.spendingState,
      counterparty: options?.counterparty,
      evaluationTimestamp: timestamp,
    };

    const results: RuleEvaluationResult[] = [];
    const satisfiedRuleIds: string[] = [];
    const violatedRuleIds: string[] = [];
    const allEvidence: EvidenceItem[] = [];

    let highestSeverity: RuleSeverity = "info";
    let finalDecision: DecisionType = "ALLOW";
    const reasons: string[] = [];
    const remediations: string[] = [];
    let failClosedTriggered = false;

    const severityRank: Record<RuleSeverity, number> = {
      info: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const updateHighestSeverity = (newSev: RuleSeverity) => {
      if (severityRank[newSev] > severityRank[highestSeverity]) {
        highestSeverity = newSev;
      }
    };

    // Evaluate each rule deterministically
    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(context);
        results.push(result);

        if (result.passed) {
          satisfiedRuleIds.push(rule.ruleId);
        } else {
          violatedRuleIds.push(rule.ruleId);
          reasons.push(result.reason);
          updateHighestSeverity(result.severity);

          if (result.evidence) {
            allEvidence.push(result.evidence);
          }
          if (result.suggestedRemediation) {
            remediations.push(result.suggestedRemediation);
          }

          if (result.decision === "BLOCK") {
            finalDecision = "BLOCK";
          } else if (result.decision === "WARN" && finalDecision !== "BLOCK") {
            finalDecision = "WARN";
          }
        }
      } catch (err: unknown) {
        // Any unhandled rule exception in failClosed mode MUST trigger an instant BLOCK
        const errMsg = err instanceof Error ? err.message : String(err);
        violatedRuleIds.push(rule.ruleId);
        reasons.push(`Rule "${rule.name}" threw an unhandled exception: ${errMsg}`);
        updateHighestSeverity("critical");
        finalDecision = "BLOCK";
        failClosedTriggered = true;
        remediations.push("Fix internal rule evaluation input or parameters.");
      }
    }

    // Synthesize final explanation
    let summaryReason: string;
    if (finalDecision === "ALLOW") {
      summaryReason = `All ${satisfiedRuleIds.length} security rules satisfied. Action is authorized to proceed to cryptographic signing.`;
    } else if (finalDecision === "WARN") {
      summaryReason = `Action requires human confirmation: ${reasons.join(" ")}`;
    } else {
      summaryReason = `Action blocked by policy rules: ${reasons.join(" ")}`;
    }

    const decisionId = `dec-${action.actionId}-${Date.now()}`;

    return {
      decisionId,
      actionId: action.actionId,
      agentId: policy.agentId,
      decision: finalDecision,
      reason: summaryReason,
      violatedRuleIds,
      satisfiedRuleIds,
      evidence: allEvidence,
      severity: highestSeverity,
      timestamp,
      suggestedRemediation: remediations.length > 0 ? remediations.join(" ") : undefined,
      failClosedTriggered,
    };
  }

  /**
   * Updates stateful spending accumulator after an action is successfully executed.
   */
  public updateSpendingState(
    currentState: AccumulatedSpendingState | undefined,
    action: ProposedAction,
    timestamp: string = new Date().toISOString()
  ): AccumulatedSpendingState {
    const actionDate = timestamp.slice(0, 10); // YYYY-MM-DD
    const actionValue = toBigIntYocto(action.amountYocto || "0");

    if (!currentState || currentState.dateString !== actionDate) {
      // New day rollover (UTC)
      return {
        agentId: action.agentId,
        dateString: actionDate,
        accumulatedDailyYocto: actionValue.toString(),
        actionsInCurrentHour: 1,
        lastActionTimestamp: timestamp,
      };
    }

    const prevAccumulated = toBigIntYocto(currentState.accumulatedDailyYocto);
    const newAccumulated = prevAccumulated + actionValue;

    // Check if within the same hour
    const prevHour = new Date(currentState.lastActionTimestamp).getUTCHours();
    const currHour = new Date(timestamp).getUTCHours();
    const actionsInHour = prevHour === currHour ? currentState.actionsInCurrentHour + 1 : 1;

    return {
      agentId: action.agentId,
      dateString: actionDate,
      accumulatedDailyYocto: newAccumulated.toString(),
      actionsInCurrentHour: actionsInHour,
      lastActionTimestamp: timestamp,
    };
  }
}
