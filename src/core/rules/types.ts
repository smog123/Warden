import {
  ProposedAction,
  AgentPolicy,
  CounterpartyAssessment,
  AccumulatedSpendingState,
  DecisionType,
  RuleSeverity,
  EvidenceItem,
} from "../models";

export interface RuleEvaluationContext {
  action: ProposedAction;
  policy: AgentPolicy;
  spendingState?: AccumulatedSpendingState;
  counterparty?: CounterpartyAssessment;
  evaluationTimestamp?: string; // Optional override for deterministic testing
}

export interface RuleEvaluationResult {
  ruleId: string;
  passed: boolean;
  decision: DecisionType; // If passed, usually ALLOW. If failed, WARN or BLOCK.
  reason: string;
  severity: RuleSeverity;
  evidence?: EvidenceItem;
  suggestedRemediation?: string;
}

export interface SecurityRule {
  readonly ruleId: string;
  readonly name: string;
  readonly description: string;
  evaluate(context: RuleEvaluationContext): RuleEvaluationResult;
}
