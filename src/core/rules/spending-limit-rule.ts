import { SecurityRule, RuleEvaluationContext, RuleEvaluationResult } from "./types";
import { toBigIntYocto, yoctoToNear } from "../math/yocto";

export const RULE_SPENDING_LIMIT_EXHAUSTION_ID = "RULE_SPENDING_LIMIT_EXHAUSTION";

export class SpendingLimitExhaustionRule implements SecurityRule {
  readonly ruleId = RULE_SPENDING_LIMIT_EXHAUSTION_ID;
  readonly name = "Cumulative Spending & Rate Limit Rule";
  readonly description = "Enforces 24-hour aggregate budget ceilings and hourly transaction rate limits.";

  evaluate(context: RuleEvaluationContext): RuleEvaluationResult {
    const { action, policy, spendingState } = context;

    let actionValue: bigint;
    let dailyLimit: bigint;
    let currentAccumulated: bigint = 0n;

    try {
      actionValue = toBigIntYocto(action.amountYocto || "0");
      dailyLimit = toBigIntYocto(policy.dailySpendingThresholdYocto);
      if (spendingState?.accumulatedDailyYocto) {
        currentAccumulated = toBigIntYocto(spendingState.accumulatedDailyYocto);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Spending limit arithmetic error: ${msg}`,
      };
    }

    // 1. Check cumulative 24h budget
    const projectedTotal = currentAccumulated + actionValue;
    if (projectedTotal > dailyLimit) {
      return {
        ruleId: this.ruleId,
        passed: false,
        decision: "BLOCK",
        severity: "critical",
        reason: `Action would breach the daily aggregate spending limit. Projected total: ${yoctoToNear(projectedTotal)} Ⓝ, Daily limit: ${yoctoToNear(dailyLimit)} Ⓝ (Already spent: ${yoctoToNear(currentAccumulated)} Ⓝ).`,
        evidence: {
          ruleId: this.ruleId,
          category: "DAILY_BUDGET_EXCEEDED",
          observed: projectedTotal.toString(),
          expected: policy.dailySpendingThresholdYocto,
          description: "Projected cumulative daily spending exceeds maximum allowed daily threshold.",
        },
        suggestedRemediation: "Wait for the 24-hour UTC window to roll over or request an authorized policy limit increase.",
      };
    }

    // 2. Check sliding-window actions per hour rate limit
    if (policy.maxActionsPerHour !== undefined && policy.maxActionsPerHour > 0) {
      const currentHourlyActions = spendingState?.actionsInCurrentHour || 0;
      if (currentHourlyActions >= policy.maxActionsPerHour) {
        return {
          ruleId: this.ruleId,
          passed: false,
          decision: "BLOCK",
          severity: "high",
          reason: `Hourly transaction rate limit exceeded (${currentHourlyActions}/${policy.maxActionsPerHour} actions in current hour). Salami attack defense triggered.`,
          evidence: {
            ruleId: this.ruleId,
            category: "HOURLY_RATE_LIMIT_EXCEEDED",
            observed: currentHourlyActions + 1,
            expected: policy.maxActionsPerHour,
            description: "Agent transaction frequency exceeds maximum authorized actions per hour.",
          },
          suggestedRemediation: "Throttle agent execution frequency or increase maxActionsPerHour in policy.",
        };
      }
    }

    return {
      ruleId: this.ruleId,
      passed: true,
      decision: "ALLOW",
      severity: "info",
      reason: `Projected daily spending of ${yoctoToNear(projectedTotal)} Ⓝ is within the daily ceiling (${yoctoToNear(dailyLimit)} Ⓝ).`,
    };
  }
}
