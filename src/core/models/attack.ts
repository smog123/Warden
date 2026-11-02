import { ProposedAction } from "./action";
import { DecisionType, PolicyDecision } from "./decision";

export type AttackVector =
  | "PROMPT_INJECTION"
  | "SALAMI_SPLITTING"
  | "ADDRESS_HIJACK"
  | "FREEZE_EVASION"
  | "METHOD_SPOOF";

export interface AttackScenario {
  scenarioId: string;
  name: string;
  description: string;
  vector: AttackVector;
  adversarialInstruction: string;
  simulatedPayload: ProposedAction;
  expectedDecision: DecisionType;
  expectedViolationRuleId: string;
}

export interface AttackResult {
  runId: string;
  scenarioId: string;
  passed: boolean;
  actualDecision: DecisionType;
  interceptionStage: "PRE_SIGNATURE_HALTED" | "PASSED_UNGUARDED" | "ESCALATED_TO_HUMAN";
  decisionTrace: PolicyDecision;
  executedAt: string;
}
